import { io } from "socket.io-client";
const URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
let socket = null;

export function connectSocket() {
  if (!socket) socket = io(URL);
  return socket;
}

export function getSocket() {
  return socket;
}
