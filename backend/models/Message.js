import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String },
  attachments: [{ type: String }],
  delivered: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
