import User from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import jwt from "jsonwebtoken";

const onlineUsers = new Map();

export default function(io, socket) {
  // Identify user from handshake token
  const token = socket.handshake?.auth?.token;
  let authedUserId = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      authedUserId = decoded?.id;
    } catch {}
  }

  (async () => {
    if (authedUserId) {
      onlineUsers.set(String(authedUserId), socket.id);
      try {
        await User.findByIdAndUpdate(authedUserId, { online: true });
      } catch {}
      io.emit("user:status", { userId: String(authedUserId), online: true });
    }
  })();

  // Fallback manual online event (kept for compatibility)
  socket.on("user:online", async ({ userId }) => {
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { online: true });
    io.emit("user:status", { userId, online: true });
  });

  // User disconnects
  socket.on("disconnect", async () => {
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        try {
          await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });
        } catch {}
        io.emit("user:status", { userId, online: false });
      }
    }
  });

  // Typing indicator (expects { to, from, conversationId })
  socket.on("typing:start", ({ to, from, conversationId }) => {
    if (onlineUsers.has(to)) {
      io.to(onlineUsers.get(to)).emit("typing", { from, conversationId, typing: true });
    }
  });
  socket.on("typing:stop", ({ to, from, conversationId }) => {
    if (onlineUsers.has(to)) {
      io.to(onlineUsers.get(to)).emit("typing", { from, conversationId, typing: false });
    }
  });

  // Send message with ack + delivered
  socket.on("message:send", async ({ conversationId, sender, to, text }, ack) => {
    const isRecipientOnline = onlineUsers.has(to);
    const message = new Message({ conversationId, sender, text, delivered: isRecipientOnline });
    await message.save();
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id });

    // Acknowledge to sender with saved message
    if (typeof ack === "function") {
      try { ack(message); } catch {}
    } else {
      // Fallback event (not required if client uses ack)
      if (onlineUsers.has(sender)) io.to(onlineUsers.get(sender)).emit("message:sent", message);
    }

    // Forward to recipient
    if (isRecipientOnline) {
      io.to(onlineUsers.get(to)).emit("message:new", message);
      // Notify sender of delivery
      if (onlineUsers.has(sender)) {
        io.to(onlineUsers.get(sender)).emit("message:delivered", { messageId: message._id });
      }
    }
  });

  // Read receipt
  socket.on("message:read", async ({ messageId }) => {
    const msg = await Message.findByIdAndUpdate(messageId, { read: true }, { new: true });
    if (!msg) return;
    // notify reader (optional)
    socket.emit("message:read", { messageId });
    // notify original sender
    const senderId = String(msg.sender);
    if (onlineUsers.has(senderId)) {
      io.to(onlineUsers.get(senderId)).emit("message:read", { messageId });
    }
  });
}
