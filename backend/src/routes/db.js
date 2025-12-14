import mongoose from "mongoose";

export default async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not set. Check your .env file.");
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ MongoDB connected successfully");
  } catch (err) {
    console.error("✗ MongoDB connection error:", err.message);
    throw err;
  }
}
