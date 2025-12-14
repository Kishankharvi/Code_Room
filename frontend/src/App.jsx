import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import RoomPage from "./pages/RoomPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/create-room" element={<CreateRoom/>} />
      <Route path="/join-room" element={<JoinRoom/>} />
      <Route path="/room/:roomId" element={<RoomPage/>} />
    </Routes>
  );
}
