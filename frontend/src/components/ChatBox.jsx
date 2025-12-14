import React, { useState, useEffect, useContext } from 'react';
import { RoomContext } from '../context/RoomContext';
import { UserContext } from '../context/UserContext';
import PresenceBar from './PresenceBar';

export default function ChatBox({ participants }) {
  const { socket, room } = useContext(RoomContext);
  const { user } = useContext(UserContext);
  const [msg, setMsg] = useState('');
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      setList((prev) => [...prev, data]);
    };

    socket.on('receive-chat', handleMessage);

    return () => {
      socket.off('receive-chat', handleMessage);
    };
  }, [socket]);

  const sendMessage = () => {
    if (!msg.trim() || !user || !room) return;

    const payload = {
      roomId: room.roomId,
      username: user.username,
      text: msg,
    };

    socket.emit('send-chat', payload);
    setList((prev) => [...prev, payload]);
    setMsg('');
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-2">
      <div className="mb-4">
        <PresenceBar participants={participants} />
      </div>
      <h3 className="font-bold mb-2 text-md">Chat</h3>
      <div className="flex-1 overflow-auto space-y-2 p-2 bg-gray-800 rounded">
        {list.map((m, i) => (
          <p key={i} className="text-sm break-words">
            <b className="text-blue-400">{m.username}</b>: {m.text}
          </p>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 p-2 text-sm border rounded-md bg-gray-700 border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Message..."
        />
        <button onClick={sendMessage} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm">
          Send
        </button>
      </div>
    </div>
  );
}
