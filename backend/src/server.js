import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import executeRoute from "./routes/execute.js";
import registerSocketHandlers from "./socketHandlers.js";

const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use((req, res, next) => {
  if (req.path.includes("/api/auth")) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log("[v0] Body:", JSON.stringify(req.body));
  }
  next();
});

try {
  await connectDB();
} catch (err) {
  console.error("Failed to start server - Database connection failed:", err.message);
  process.exit(1);
}
app.get("/", (req, res) => {
  res.send("CodeRoom Backend is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/execute", executeRoute);

app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

registerSocketHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
