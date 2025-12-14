import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Dashboard(){
  const nav = useNavigate();
  const { user, logout, loading } = useContext(UserContext);

  useEffect(() => {
    if (!loading && !user) {
      nav("/");
    }
  }, [user, loading, nav]);

  if (loading) {
    return <div>Loading...</div>;
  }

  function handleLogout() {
    logout();
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
            <button onClick={()=>nav("/create-room")} className="btn btn-primary">
              Create Room
            </button>
          </div>

          <div className="card">
            <div className="card-icon">🚪</div>
            <h2>Join a Room</h2>
            <p>Enter an existing session using a room code</p>
            <button onClick={()=>nav("/join-room")} className="btn btn-primary">
              Join Room
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
