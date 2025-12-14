import React, { useState, useContext, useEffect } from "react";
import { getRoom } from "../services/api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function JoinRoom(){
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: userLoading } = useContext(UserContext);
  const nav = useNavigate();

  useEffect(() => {
    if (!userLoading && !user) {
      nav("/");
    }
  }, [user, userLoading, nav]);

  if (userLoading) {
    return <div>Loading...</div>
  }

  async function doJoin(){
    setError("");
    if(!roomId.trim()) {
      setError("Please enter a room ID");
      return;
    }
    if (!user) {
        setError("You must be logged in to join a room.");
        return;
    }
    try {
      setLoading(true);
      const r = await getRoom(roomId, user);
      if(r?.roomId) {
        nav(`/room/${roomId}`);
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
