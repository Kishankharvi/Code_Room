import Room from "./models/Room.js";

export default function registerSocketHandlers(io) {

  const getParticipants = async (roomId) => {
    const sockets = await io.in(roomId).fetchSockets();
    const participants = [];
    for (const socket of sockets) {
        if (socket.data.user) {
            participants.push({ 
                ...socket.data.user, 
                role: socket.data.role 
            });
        }
    }
    return participants;
  };

  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);

    socket.on("join-room", async ({ roomId, user }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) return;

        socket.join(roomId);
        socket.data.user = user;

        let role = "participant";
        if (room.createdBy.toString() === user._id.toString()) {
            role = "mentor";
        }
        socket.data.role = role;

        const participants = await getParticipants(roomId);
        io.to(roomId).emit("update-participants", participants);

      } catch (e) {
        console.error("Error joining room:", e);
      }
    });

    socket.on("send-chat", (msg) => {
      io.to(msg.roomId).emit("receive-chat", msg);
    });

    socket.on("code-change", async ({ roomId, code }) => {
        try {
            const room = await Room.findOne({ roomId });
            if (!room) return;
    
            if (room.mode === "teaching" && socket.data.role !== "mentor") {
                return; 
            }
            
            socket.to(roomId).emit("code-update", { code, from: socket.id });
        } catch (e) {
            console.error("Error handling code change:", e);
        }
    });

    socket.on('cursor:move', ({ roomId, position }) => {
        if (socket.data.user) {
            socket.to(roomId).emit('cursor:move', {
                userId: socket.data.user._id,
                username: socket.data.user.username,
                position,
            });
        }
    });

    socket.on("disconnect", async () => {
      console.log("socket disconnected", socket.id);
      
      const rooms = Array.from(socket.rooms);
      if (rooms.length > 1) {
        const roomId = rooms[1];
        const participants = await getParticipants(roomId);
        io.to(roomId).emit("update-participants", participants);
      }
    });
  });
}
