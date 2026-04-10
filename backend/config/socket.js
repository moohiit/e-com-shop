import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Conversation from "../models/Conversation.js";

export const setupSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL, "http://localhost:5173"],
      credentials: true,
    },
  });

  // Make io accessible in controllers via req.app.get("io")
  app.set("io", io);

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userName = decoded.name;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join a conversation room — verify the user is a participant first
    socket.on("joinConversation", async (conversationId) => {
      try {
        const conv = await Conversation.findById(conversationId).select("participants").lean();
        if (conv && conv.participants.some((p) => p.toString() === socket.userId)) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch {
        // Silently ignore invalid IDs
      }
    });

    // Leave a conversation room
    socket.on("leaveConversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing indicators — only broadcast to rooms the user has joined
    socket.on("typing", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("userTyping", {
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on("stopTyping", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("userStopTyping", {
        userId: socket.userId,
      });
    });

    socket.on("disconnect", () => {
      // Socket.io auto-cleans room membership on disconnect
    });
  });

  return io;
};
