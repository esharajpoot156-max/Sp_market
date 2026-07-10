import Message from "../models/Message.js";

// Get all messages in a conversation
export const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const isParty = conversationId.split("_").includes(req.user._id.toString());
    if (!isParty) {
      return res.status(403).json({ message: "Not authorized to view this conversation" });
    }

    const messages = await Message.find({ conversationId })
      .populate("senderId", "name profilePicture")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

// Get list of all conversations for logged-in user (inbox)
export const getMyConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId", "name profilePicture")
      .populate("receiverId", "name profilePicture")
      .sort({ createdAt: -1 });

    // Group by conversationId, keep only latest message per conversation
    const conversationsMap = new Map();
    for (const msg of messages) {
      if (!conversationsMap.has(msg.conversationId)) {
        const otherUser =
          msg.senderId._id.toString() === userId.toString() ? msg.receiverId : msg.senderId;

        conversationsMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          otherUser,
          lastMessage: msg.text || "📷 Image",
          lastMessageTime: msg.createdAt,
          isRead: msg.isRead || msg.senderId._id.toString() === userId.toString(),
        });
      }
    }

    res.status(200).json(Array.from(conversationsMap.values()));
  } catch (error) {
    next(error);
  }
};