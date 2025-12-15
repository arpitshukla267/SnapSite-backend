import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: ["https://snapsite-virid.vercel.app", "http://localhost:3000"] }));
app.get("/", (req, res) => {
  res.send("Backend running");
});

app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
