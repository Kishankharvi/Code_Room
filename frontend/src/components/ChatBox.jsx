import React, { useState, useEffect } from "react";

export default function ChatBox({ socket, roomId, username }) {
  const [msg, setMsg] = useState("");
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!socket) return;
    socket.on("chat:message", (m) => setList((prev) => [...prev, m]));
  }, [socket]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    socket.emit("chat:message", { roomId, username, message: msg });
    setMsg("");
  };

  return (
    <div className="card h-[300px] flex flex-col">
      <div className="flex-1 overflow-auto space-y-1">
        {list.map((m, i) => (
          <p key={i} className="text-sm">
            <b>{m.username}</b>: {m.message}
          </p>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 p-2 border rounded-xl"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button onClick={sendMessage} className="btn-primary">
          Send
        </button>
      </div>
    </div>
  );
}
