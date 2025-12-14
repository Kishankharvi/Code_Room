import React, { useState } from "react";
import { getRoom } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function JoinRoom(){
  const [roomId,setRoomId]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const user = JSON.parse(localStorage.getItem("user")||"null");
  const nav=useNavigate();

  if(!user) {
    nav("/");
    return null;
  }

  async function doJoin(){
    setError("");
    if(!roomId.trim()) {
      setError("Please enter a room ID");
      return;
    }
    try {
      setLoading(true);
      const r = await getRoom(roomId,user);
      if(r?.roomId) {
        nav(`/room/${roomId}`, { state: { user }});
      } else {
        setError("Room not found");
      }
    } catch(err) {
      setError(err.response?.data?.message || "Room not found");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <div className="form-box">
        <div className="form-header">
          <button onClick={()=>nav("/dashboard")} className="back-btn">← Back</button>
          <h2>Join a Room</h2>
        </div>

        <div className="form-content">
          <div className="form-group">
            <label>Room ID</label>
            <input 
              type="text"
              placeholder="Enter the room ID" 
              value={roomId} 
              onChange={e=>setRoomId(e.target.value)}
              onKeyPress={e => e.key === "Enter" && doJoin()}
              className="form-input"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button onClick={doJoin} className="btn btn-primary" disabled={loading}>
            {loading ? "Joining..." : "Join Room"}
          </button>
        </div>
      </div>
    </div>
  );
}
