import express from "express";
import { getConversationMessages, getMyConversations } from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/conversations", protect, getMyConversations);
router.get("/:conversationId", protect, getConversationMessages);

export default router;