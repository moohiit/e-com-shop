import express from "express";
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/conversations", getOrCreateConversation);
router.get("/conversations", getMyConversations);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/messages", sendMessage);

export default router;
