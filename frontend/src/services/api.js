import axios from "axios";

const BASE = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const api = axios.create({ baseURL: BASE + "/api" });

export const register = (payload) => api.post("/auth/register", payload).then(r => r.data);
export const login = (payload) => api.post("/auth/login", payload).then(r => r.data);

export const createRoom = (userId, mode="one-to-one", maxUsers=2, language="javascript") =>
  api.post("/rooms/create", { userId, mode, maxUsers, language }).then(r => r.data);

// export const getRoom = (roomId) => api.get(`/rooms/${roomId}`).then(r => r.data);

export const getRoom = (roomId, user) =>
  api.post(`/rooms/${roomId}/join`, { user }).then(r => r.data);

export const executeCode = (payload) => api.post("/execute", payload).then(r => r.data);
