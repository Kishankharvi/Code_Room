import os
import pty
from socket import socket
import Room from "./models/Room.js";

# Keep track of the PTY processes
ptys = {}

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

    // Create a new pseudo-terminal for each connecting socket
    const shell = os.environ.get('SHELL', 'bash')
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.PWD,
        env: process.env
    })

    // Store the PTY process
    ptys[socket.id] = ptyProcess

    // Handle data from the PTY and send it to the client
    ptyProcess.on('data', function (data) {
        socket.emit('terminal:response', data.toString());
    });

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

    // Handle incoming terminal data from the client
    socket.on('terminal:data', (data) => {
        if (ptys[socket.id]) {
            ptys[socket.id].write(data);
        }
    });

    socket.on("disconnect", async () => {
      console.log("socket disconnected", socket.id);
      
      // Kill the PTY process when the socket disconnects
      if (ptys[socket.id]) {
        ptys[socket.id].kill();
        delete ptys[socket.id];
      }

      const rooms = Array.from(socket.rooms);
      if (rooms.length > 1) {
        const roomId = rooms[1];
        const participants = await getParticipants(roomId);
        io.to(roomId).emit("update-participants", participants);
      }
    });
  });
}
