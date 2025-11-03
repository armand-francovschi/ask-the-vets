import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import petsRoutes from "./routes/petsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

import { fileURLToPath } from "url";
import { registerChatSocket } from "./sockets/chatSocket.js";

const app = express();
const PORT = 5000;

// ✅ Allow localhost and Ngrok URLs dynamically
const allowedOrigins = [
  "http://localhost:5173",
  "https://nonoperative-skyla-prolongably.ngrok-free.dev" // add your current Ngrok URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/pets", petsRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

// ✅ HTTP + Socket.IO integration with updated CORS
const server = http.createServer(app);
app.use(cors({ origin: true, credentials: true }));
const io = new Server(server, { cors: { origin: true, methods: ["GET","POST"], credentials: true } });

// Register chat socket handlers
registerChatSocket(io);

console.clear();

// ✅ Listen on the HTTP server
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
