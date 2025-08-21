import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .populate("sender", "_id username avatar email");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrCreateConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.body;
    if (!otherUserId) return res.status(400).json({ error: "otherUserId required" });

    // Validate other user exists
    const other = await User.findById(otherUserId).select("_id");
    if (!other) return res.status(404).json({ error: "User not found" });

    // Find existing conversation with both participants
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, otherUserId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, otherUserId],
        isGroup: false,
      });
    }

    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const conversations = await Conversation.find({ participants: currentUserId })
      .sort({ updatedAt: -1 })
      .populate("participants", "_id username avatar email status lastSeen")
      .populate({ path: "lastMessage", populate: { path: "sender", select: "_id username avatar" } });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
