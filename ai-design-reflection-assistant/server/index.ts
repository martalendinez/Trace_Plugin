require("dotenv").config();
console.log("ENV LOADED:", process.env.OPENAI_API_KEY ? "YES" : "NO");

const express = require("express");
const cors = require("cors");
const reflectRoute = require("./reflect");

const app = express();
app.use(cors());
app.use(express.json());

// Mount route
app.use("/api/reflect", reflectRoute);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
