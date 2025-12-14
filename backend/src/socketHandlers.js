export default function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);

    socket.on("join-room", ({ roomId, user }) => {
      socket.join(roomId);
      socket.data.user = user;
      io.to(roomId).emit("user-joined", { user, socketId: socket.id });
    });

    socket.on("send-chat", (msg) => {
      // msg: { roomId, username, text }
      io.to(msg.roomId).emit("receive-chat", msg);
    });

    socket.on("code-change", ({ roomId, code }) => {
      console.log("Received code change from", socket.id);
      console.log("Emitting code update to room", roomId,code);

      socket.to(roomId).emit("code-update", { code, from: socket.id });
    });

    socket.on("disconnect", () => {
      // optionally notify room
      console.log("socket disconnected", socket.id);
    });
  });
}
 