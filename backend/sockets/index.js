import User from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

const onlineUsers = new Map();

export default function(io, socket) {
  // User connects
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
        await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });
        io.emit("user:status", { userId, online: false });
      }
    }
  });

  // Typing indicator
  socket.on("typing:start", ({ to }) => {
    if (onlineUsers.has(to)) {
      io.to(onlineUsers.get(to)).emit("typing", { from: socket.id, typing: true });
    }
  });
  socket.on("typing:stop", ({ to }) => {
    if (onlineUsers.has(to)) {
      io.to(onlineUsers.get(to)).emit("typing", { from: socket.id, typing: false });
    }
  });

  // Send message
  socket.on("message:send", async ({ conversationId, sender, to, text }) => {
    const message = new Message({ conversationId, sender, text });
    await message.save();
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id });
    if (onlineUsers.has(to)) {
      io.to(onlineUsers.get(to)).emit("message:new", message);
    }
  });

  // Read receipt
  socket.on("message:read", async ({ messageId }) => {
    await Message.findByIdAndUpdate(messageId, { read: true });
    socket.emit("message:read", { messageId });
  });
}
