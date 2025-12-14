import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Dashboard(){
  const nav=useNavigate();
  const user=JSON.parse(localStorage.getItem("user")||"null") || (useLocation().state?.user);

  if(!user) {
    nav("/");
    return null;
  }

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>CodeMentor</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, <strong>{user?.username || "User"}</strong></span>
            <button onClick={handleLogout} className="btn btn-outline">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-cards">
          <div className="card">
            <div className="card-icon">📝</div>
            <h2>Create a Room</h2>
            <p>Start a new mentoring session with customizable settings</p>
            <button onClick={()=>nav("/create-room",{state:{user}})} className="btn btn-primary">
              Create Room
            </button>
          </div>

          <div className="card">
            <div className="card-icon">🚪</div>
            <h2>Join a Room</h2>
            <p>Enter an existing session using a room code</p>
            <button onClick={()=>nav("/join-room",{state:{user}})} className="btn btn-primary">
              Join Room
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
