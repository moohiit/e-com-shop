import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// Get or create a conversation between two users (optionally about a product)
export const getOrCreateConversation = async (req, res) => {
  try {
    const { recipientId, productId } = req.body;
    const userId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: "Recipient ID is required" });
    }

    if (recipientId === userId.toString()) {
      return res.status(400).json({ success: false, message: "Cannot chat with yourself" });
    }

    // Find existing conversation between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
      ...(productId ? { product: productId } : {}),
    }).populate("participants", "name email avatar role");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, recipientId],
        product: productId || undefined,
      });
      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "name email avatar role")
        .populate("product", "name images");
    }

    res.json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all conversations for the logged-in user
export const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name email avatar role")
      .populate("product", "name images")
      .sort({ "lastMessage.createdAt": -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const total = await Message.countDocuments({ conversation: conversationId });
    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name avatar role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } }
    );

    // Reset unread count for this user
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    res.json({
      success: true,
      messages: messages.reverse(), // oldest first
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send a message (REST fallback — Socket.io is preferred)
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!conversationId || !text?.trim()) {
      return res.status(400).json({ success: false, message: "Conversation ID and text are required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text: text.trim(),
      readBy: [req.user._id],
    });

    // Update conversation's last message
    conversation.lastMessage = {
      text: text.trim(),
      sender: req.user._id,
      createdAt: new Date(),
    };

    // Increment unread count for other participants
    for (const participantId of conversation.participants) {
      if (participantId.toString() !== req.user._id.toString()) {
        const current = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), current + 1);
      }
    }

    await conversation.save();

    const populated = await Message.findById(message._id).populate("sender", "name avatar role");

    // Emit via socket if available
    const io = req.app.get("io");
    if (io) {
      for (const participantId of conversation.participants) {
        if (participantId.toString() !== req.user._id.toString()) {
          io.to(`user:${participantId}`).emit("newMessage", {
            message: populated,
            conversationId,
          });
        }
      }
    }

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
