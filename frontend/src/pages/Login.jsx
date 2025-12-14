import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const { user, login, register } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  async function doRegister() {
    if (!username || !email || !password) {
      alert("Please fill in all fields");
      return;
    }
    try {
      await register({ username, email, password });
      alert("Registration successful!");
      navigate("/dashboard");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed";
      if (errorMsg.includes("already")) {
        alert("This email is already registered");
      } else if (errorMsg.includes("valid")) {
        alert("Invalid email or password format");
      } else {
        alert(errorMsg);
      }
    }
  }

  async function doLogin() {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    try {
      await login({ email, password });
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.response?.data?.error || "Login failed";
      if (errorMsg.includes("not found") || errorMsg.includes("incorrect")) {
        alert("Invalid email or password");
      } else {
        alert(errorMsg);
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>CodeMentor</h1>
          <p>Real-time collaborative code mentoring</p>
        </div>

        <div className="login-form">
          {isRegister && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="button-group">
            {isRegister ? (
              <button onClick={doRegister} className="btn btn-primary">
                Register
              </button>
            ) : (
              <button onClick={doLogin} className="btn btn-primary">
                Login
              </button>
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            {isRegister ? (
              <p>
                Already have an account?{" "}
                <span
                  onClick={() => setIsRegister(false)}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  Login
                </span>
              </p>
            ) : (
              <p>
                if not account existed,{" "}
                <span
                  onClick={() => setIsRegister(true)}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  Create new account
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
