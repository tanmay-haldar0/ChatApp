import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "_id username email avatar status lastSeen");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
