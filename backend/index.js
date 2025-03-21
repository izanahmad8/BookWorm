import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import bookRouter from "./routes/bookRoutes.js";

const app = express();

//middlewares
app.use(express.json());
app.use(cors());

//database connection
connectDB();

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
