import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/api";
import Toast from "../components/Toast";

export default function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const nav = useNavigate();

  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  async function doRegister(){
    if(!username || !email || !password) {
      showToast("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      console.log("[v0] Registering with:", { username, email });
      const res = await register({username, email, password});
      console.log("[v0] Registration response:", res);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("token", res.token);
      showToast("Registration successful!", "success");
      setTimeout(() => {
        nav("/dashboard", { state: { user: res.user }});
      }, 1000);
    } catch(err) {
      console.log("[v0] Registration error:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Registration failed";
      if (errorMsg.includes("already")) {
        showToast("This email is already registered");
      } else if (errorMsg.includes("valid")) {
        showToast("Invalid email or password format");
      } else {
        showToast(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function doLogin(){
    if(!email || !password) {
      showToast("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      console.log("[v0] Logging in with:", { email });
      const res = await login({email, password});
      console.log("[v0] Login response:", res);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("token", res.token);
      showToast("Login successful!", "success");
      setTimeout(() => {
        nav("/dashboard", { state: { user: res.user }});
      }, 1000);
    } catch(err) {
      console.log("[v0] Login error:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Login failed";
      if (errorMsg.includes("not found") || errorMsg.includes("incorrect")) {
        showToast("Invalid email or password");
      } else {
        showToast(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="login-box">
        <div className="login-header">
          <h1>CodeMentor</h1>
          <p>Real-time collaborative code mentoring</p>
        </div>
        
        <div className="login-form">
          <div className="form-group">
            <label>Username (for registration)</label>
            <input 
              type="text"
              placeholder="Enter your username" 
              value={username} 
              onChange={e=>setUsername(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email"
              placeholder="Enter your email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password"
              placeholder="Enter your password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="button-group">
            <button onClick={doLogin} className="btn btn-primary" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>
            <button onClick={doRegister} className="btn btn-secondary" disabled={loading}>
              {loading ? "Loading..." : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
