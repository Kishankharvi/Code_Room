import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  mode: { type: String, enum: ["one-to-one","class"], default: "one-to-one" },
  maxUsers: { type: Number, default: 2 },
  language: { type: String, default: "javascript" },
  users: [{ userId: String, username: String }]
}, { timestamps: true });

export default mongoose.model("Room", roomSchema);
