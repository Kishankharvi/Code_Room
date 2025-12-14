import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { language, code } = req.body;
    if (!language || !code) {
      return res.status(400).json({ error: "Missing language or code" });
    }

    const pistonUrl = process.env.PISTON_API || 'https://emkc.org/api/v2/piston/execute';
    console.log(" Executing code with language:", language, "at:", pistonUrl);

    const response = await axios.post(pistonUrl, {
      language,
      version: "*",
      files: [{ content: code }]
    }, { 
      timeout: 20000,
      headers: { 'Content-Type': 'application/json' }
    });

    const run = response.data?.run;
    const output = run?.output || run?.stderr || JSON.stringify(response.data);
    
    console.log(" Execution successful, output length:", output?.length);
    res.json({ output: output || "" });
  } catch (err) {
    console.error(" Execute error:", err?.response?.data ?? err?.message);
    const errorMsg = err?.response?.data?.message || err?.message || "Execution failed";
    res.status(500).json({ 
      error: errorMsg,
      detail: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
});

export default router;
