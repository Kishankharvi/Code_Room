import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { connectSocket, getSocket } from "../services/socket";
import { getRoom, executeCode } from "../services/api";
import PresenceBar from "../components/PresenceBar";
import Toast from "../components/Toast";
import "./room.css";

export default function RoomPage(){
  const { roomId } = useParams();
  const loc = useLocation();
  const nav = useNavigate();
  const user = loc.state?.user || JSON.parse(localStorage.getItem("user")||"null");
  
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState("// type code here\n");
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(()=> {
    (async ()=> {
      try {
        const r = await getRoom(roomId,user);
        if(!r) {
          setError("Room not found");
          return;
        }
        setRoom(r);
        if(r?.language) setCode(`// language: ${r.language}\n`);
      } catch(err) {
        setError("Failed to load room");
      }
    })();
    
    const socket = connectSocket();
    socketRef.current = socket;
    socket.emit("join-room", { roomId, user });

    socket.on("receive-chat", m => {
      setMessages(prev => [...prev, m]);
    });
    
    socket.on("code-update", ({ code: incoming }) => {
      if(incoming && incoming !== code) setCode(incoming);
    });

    socket.on("error", (err) => {
      setError(err.message || "Connection error");
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(){
    if(!chatText.trim() || !socketRef.current) return;
    const msg = { roomId, username: user.username, text: chatText, timestamp: new Date() };
    console.log("[v0] Sending chat message:", msg);

    socketRef.current.emit("send-chat", msg);
    setChatText("");
  }

  function onCodeChange(v){
    setCode(v);
    if(socketRef.current) {
      console.log("[v0] Emitting code change"+v);
      
      socketRef.current.emit("code-change", { roomId, code: v });
    }
  }


  async function run() {
    try {
      setRunning(true);
      setOutput("");
      setError("");
      console.log(" Executing code with language:", room?.language);
      
      const res = await executeCode({ 
        language: room?.language || "javascript", 
        code 
      });
      
      console.log(" Execution result:", res);
      setOutput(res.output || "Code executed successfully with no output");
      setToast({ message: "Code executed successfully!", type: "success" });
    } catch(err) {
      console.error("[v0] Execution failed:", err);
      const errorMsg = err.response?.data?.error || err.message || "Execution failed";
      setError(errorMsg);
      setToast({ message: `Execution failed: ${errorMsg}`, type: "error" });
    } finally {
      setRunning(false);
    }
  }

  const canEdit = !room ? false : (room.mode === "one-to-one" ? true : (user?._id === room.createdBy));

  if(error && error === "Room not found") {
    return (
      <div className="error-container">
        <h2>{error}</h2>
        <button onClick={() => nav("/dashboard")} className="btn btn-primary">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="room-wrapper">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="room-header">
        <div className="header-left">
          <h2>Room: <code>{roomId}</code></h2>
          <span className="mode-badge">{room?.mode === "one-to-one" ? "Interview" : "Teaching"}</span>
        </div>
        <div className="header-right">
          <span className="user-display">👤 {user?.username}</span>
          <button onClick={() => nav("/dashboard")} className="btn btn-outline btn-sm">Leave</button>
        </div>
      </header>

      <aside className="sidebar">
        <div className="sidebar-section">
          <h3 className="sidebar-title">Participants</h3>
          <div className="participants-list">
            {room?.users?.map((u,i)=> (
              <div key={i} className="participant-item">
                <span className="status-dot"></span>
                {u.username}
              </div>
            )) || <p className="empty-state">No participants yet</p>}
  {/* console.log(" Room users:",);
            <PresenceBar participants={user} /> */}
          
          </div>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-title">Language</h3>
          <div className="language-badge">{room?.language || 'javascript'}</div>
        </div>
      </aside>

      <main className="editor-section">
        <div className="editor-header">
          <span>Editor</span>
          <div className="editor-actions">
            {error && <span className="error-text">{error}</span>}
            <button className="btn btn-run" onClick={run} disabled={running || !code.trim()}>
              {running ? "⏳ Running..." : "▶ Run Code"}
            </button>
          </div>
        </div>
        
        <div className="editor-box">
          <Editor 
            height="100%" 
            language={room?.language||'javascript'} 
            value={code} 
            options={{ 
              readOnly: !canEdit,
              minimap:{enabled:false},
              fontSize: 13,
              fontFamily: "'Fira Code', monospace",
              theme: 'vs-dark'
            }} 
            onChange={onCodeChange}
            theme="vs-dark"
          />
        </div>

        <div className="output-section">
          <div className="output-header">
            <span>Output</span>
            {output && <button className="btn btn-clear" onClick={() => setOutput("")}>Clear</button>}
          </div>
          <div className="output-box">
            {output ? (
              <pre>{output}</pre>
            ) : (
              <p className="empty-state">Run your code to see output here...</p>
            )}
          </div>
        </div>
      </main>

      <aside className="chat-section">
        <div className="chat-header">
          <span>💬 Chat</span>
        </div>
        
        <div className="chat-box">
          {messages.length === 0 ? (
            <p className="empty-state">No messages yet</p>
          ) : (
            messages.map((m,i)=> (
              <div key={i} className="chat-message">
                <span className="username">{m.username}:</span>
                <span className="text">{m.text}</span>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-group">
          <input 
            value={chatText} 
            onChange={e=>setChatText(e.target.value)}
            onKeyPress={e => e.key === "Enter" && sendMessage()}
            className="chat-input" 
            placeholder="Type a message..."
          />
          <button className="chat-btn" onClick={sendMessage} disabled={!chatText.trim()}>Send</button>
        </div>
      </aside>
    </div>
  );
}
