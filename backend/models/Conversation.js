import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    lastMessage: {
      text: { type: String, default: "" },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for quick lookup
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
