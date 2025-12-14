import React, { useState } from "react";
import { createRoom } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function CreateRoom(){
  const user = JSON.parse(localStorage.getItem("user")||"null");
  const nav=useNavigate();
  const [mode,setMode]=useState("one-to-one");
  const [language,setLanguage]=useState("javascript");
  const [maxUsers,setMaxUsers]=useState(5);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  if(!user) {
    nav("/");
    return null;
  }

  async function doCreate(){
    setError("");
    try {
      setLoading(true);
      const res = await createRoom(user?._id, mode, maxUsers, language);
      if(res?.room?.roomId) {
        nav(`/room/${res.room.roomId}`, { state: { user }});
      } else {
        setError("Failed to create room");
      }
    } catch(err) {
      setError(err.response?.data?.message || "Error creating room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <div className="form-box">
        <div className="form-header">
          <button onClick={()=>nav("/dashboard")} className="back-btn">← Back</button>
          <h2>Create a New Room</h2>
        </div>

        <div className="form-content">
          <div className="form-group">
            <label>Session Mode</label>
            <select value={mode} onChange={e=>setMode(e.target.value)} className="form-select" disabled={loading}>
              <option value="one-to-one">One-to-One Interview</option>
              <option value="class">Class Teaching (One-to-Many)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Programming Language</label>
            <select value={language} onChange={e=>setLanguage(e.target.value)} className="form-select" disabled={loading}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>

          {mode==="class" && (
            <div className="form-group">
              <label>Max Participants</label>
              <input 
                type="number" 
                min="2"
                max="50"
                value={maxUsers} 
                onChange={e=>setMaxUsers(parseInt(e.target.value||"5"))}
                className="form-input"
                disabled={loading}
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button onClick={doCreate} className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Room"}
          </button>
        </div>
      </div>
    </div>
  );
}
