import express from "express";
import cors from "cors";
import reflectRoute from "./reflect";
import dotenv from "dotenv";

dotenv.config();

// Debug logs
console.log("GROQ KEY LOADED:", !!process.env.GROQ_API_KEY);

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/reflect", reflectRoute);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});