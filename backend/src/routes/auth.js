import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log("[AUTH REGISTER] Received:", { username, email, password: password ? "***" : null });
    
    if (!username || !email || !password) {
      console.log("[AUTH REGISTER] Validation failed - missing fields");
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("[AUTH REGISTER] Email already exists:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    if (!process.env.JWT_SECRET) {
      console.log("[AUTH REGISTER] JWT_SECRET not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    
    console.log("[AUTH REGISTER] User created:", user._id);
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    res.status(201).json({
      user: { _id: user._id, username: user.username, email: user.email },
      token
    });
  } catch (err) {
    console.error("[AUTH REGISTER] Error:", err.message);
    res.status(500).json({ message: err.message || "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("[AUTH LOGIN] Received:", { email, password: password ? "***" : null });
    
    if (!email || !password) {
      console.log("[AUTH LOGIN] Validation failed - missing fields");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("[AUTH LOGIN] User not found:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log("[AUTH LOGIN] Password mismatch for:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      console.log("[AUTH LOGIN] JWT_SECRET not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    console.log("[AUTH LOGIN] Login successful for:", email);
    
    res.json({
      user: { _id: user._id, username: user.username, email: user.email },
      token
    });
  } catch (err) {
    console.error("[AUTH LOGIN] Error:", err.message);
    res.status(500).json({ message: err.message || "Login failed" });
  }
});

export default router;
