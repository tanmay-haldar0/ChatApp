import express from "express";
import { getMessages, getOrCreateConversation, listConversations } from "../controllers/conversations.js";
import auth from "../middleware/auth.js";
const router = express.Router();

// List conversations for current user
router.get("/", auth, listConversations);

// Get messages for a conversation
router.get("/:id/messages", auth, getMessages);

// Get or create a 1:1 conversation with another user
router.post("/", auth, getOrCreateConversation);

export default router;
