import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import petsRoutes from "./routes/petsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";

import { fileURLToPath } from "url";
import { registerChatSocket } from "./sockets/chatSocket.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true;

  try {
    const { hostname } = new URL(origin);
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    const isLanIp =
      /^192\.168\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
    const isNgrok = hostname.endsWith(".ngrok-free.dev") || hostname.endsWith(".ngrok.io");

    return isLocalhost || isLanIp || isNgrok;
  } catch {
    return false;
  }
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/uploads/preview/:filename", (req, res) => {
  const filename = req.params.filename;
  const uploadsDir = path.join(__dirname, "uploads");
  const filePath = path.join(uploadsDir, filename);

  if (path.extname(filename).toLowerCase() !== ".pdf") {
    res.status(400).send("Preview endpoint supports only PDF files.");
    return;
  }

  const normalizedFilePath = path.normalize(filePath);
  if (!normalizedFilePath.startsWith(path.normalize(uploadsDir + path.sep))) {
    res.status(400).send("Invalid file path.");
    return;
  }

  if (!fs.existsSync(normalizedFilePath)) {
    res.status(404).send("File not found.");
    return;
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${path.basename(filename)}"`);
  res.sendFile(normalizedFilePath);
});

// Routes
app.use("/pets", petsRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/api/analysis", analysisRoutes);

// ✅ HTTP + Socket.IO integration with updated CORS
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Socket.IO CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Register chat socket handlers
registerChatSocket(io);

console.clear();

// ✅ Listen on the HTTP server
server.listen(PORT, HOST, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Server LAN endpoint: http://<your-local-ip>:${PORT}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the existing process or run with a different PORT.`);
    return;
  }

  console.error("Server failed to start:", error);
});
