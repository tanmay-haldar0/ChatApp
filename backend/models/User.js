import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  status: { type: String, enum: ["online", "offline", "away"], default: "offline" },
  lastSeen: { type: Date },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
