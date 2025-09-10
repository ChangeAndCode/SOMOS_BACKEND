import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./db.js";
import cors from "cors";

import userRoutes from "./routes/user.js";
import projectRoutes from "./routes/project.js";
import programRoutes from "./routes/program.js";
import noteRoutes from "./routes/note.js";
import eventRoutes from "./routes/event.js";
import testimonyRoutes from "./routes/testimony.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;
await connectDB();

const allowedOrigins = [
  "https://vented5.github.io",
  "https://miniature-disco-wgwg9p6wj9q2vgwr-5174.app.github.dev",
  "https://miniature-disco-wgwg9p6wj9q2vgwr-5173.app.github.dev",
  "http://localhost:5173", // para desarrollo
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.options("/api/{*any}", cors(corsOptions));
//app.options('/api/*', cors(corsOptions));

// ---- Routes ----------
app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/testimonies", testimonyRoutes);
//app.post("/api/auth/login", loginUser);
app.use("/api/auth", authRoutes);

app.listen(port, () => console.log(`App listening on port ${port}`));
