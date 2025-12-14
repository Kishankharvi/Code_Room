import express from "express";
import Room from "../models/Room.js";
import { generateRoomId } from "../utils/generateId.js";

const router = express.Router();

// create room
router.post("/create", async (req, res) => {
  try {
    const { user, mode = "one-to-one", maxUsers = 2, language = "javascript" } = req.body;
    const roomId = generateRoomId(8);
    const room = await Room.create({ roomId, createdBy: user._id, mode, maxUsers, language });
    room.users.push({ userId: user._id, username: user.username }); // Initial user
    await room.save();
    res.json({ success: true, room });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// get room details
// router.get("/:roomId", async (req, res) => {
//   try {
//     const room = await Room.findOne({ roomId: req.params.roomId });
//     if (!room) return res.status(404).json({ error: "Not found" });

//     res.json(room);
//   } catch (err) { res.status(500).json({ error: err.message }); }
// });



//replaced join room logic
router.post("/:roomId/join", async (req, res) => {
  try {
    const { user } = req.body;  // userId, name, avatar, etc.

    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const exists = room.users.some(u => u.userId === user._id);
    if (!exists) {
      room.users.push({ userId: user._id, username: user.username });
      await room.save();
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
