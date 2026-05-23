import { Server, Socket } from "socket.io";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface User {
  id: string;
  name: string;
}

interface ScheduleEntry {
  id: number;
  doctorId: number;
  ownerId?: number;
  status: "scheduled" | "completed" | "cancelled";
}

const users: Record<string, User> = {};
const socketToCallRoom: Record<string, string> = {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schedulesPath = path.join(__dirname, "..", "data", "schedules.json");

const readSchedules = (): ScheduleEntry[] => {
  try {
    const raw = fs.readFileSync(schedulesPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const registerChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // When a user joins, add to users object
    socket.on("join", (name: string) => {
      if (!name) return;

      users[socket.id] = { id: socket.id, name };
      console.log("Users:", users);

      // Broadcast updated list to all clients
      io.emit("userList", Object.values(users).map((u) => u.name));
    });

    // Public message
    socket.on("sendMessage", (data: { from: string; content: string }) => {
      io.emit("message", data);
    });

    // Private message
    socket.on("privateMessage", (data: { from: string; to: string; content: string }) => {
      if (!data.to) return;

      const recipientSocketId = Object.keys(users).find(
        (id) => users[id]?.name === data.to
      );

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("privateMessage", data); // to recipient
        socket.emit("privateMessage", data); // also to sender
      }
    });

    socket.on(
      "call:join",
      (
        payload: { scheduleId?: number; userId?: number },
        ack?: (response: { ok: boolean; message?: string; roomId?: string; participants?: number }) => void
      ) => {
        const scheduleId = Number(payload?.scheduleId);
        const userId = Number(payload?.userId);

        if (!scheduleId || !userId) {
          ack?.({ ok: false, message: "Invalid scheduleId or userId" });
          return;
        }

        const schedule = readSchedules().find(s => s.id === scheduleId && s.status === "scheduled");
        if (!schedule) {
          ack?.({ ok: false, message: "Scheduled call not found" });
          return;
        }

        const allowed = schedule.doctorId === userId || schedule.ownerId === userId;
        if (!allowed) {
          ack?.({ ok: false, message: "You are not part of this call" });
          return;
        }

        const roomId = `call-${scheduleId}`;
        const currentParticipants = io.sockets.adapter.rooms.get(roomId)?.size || 0;

        if (currentParticipants >= 2) {
          ack?.({ ok: false, message: "Call already has 2 participants" });
          return;
        }

        socket.join(roomId);
        socketToCallRoom[socket.id] = roomId;

        const participants = io.sockets.adapter.rooms.get(roomId)?.size || 1;
        socket.to(roomId).emit("call:ready");

        ack?.({ ok: true, roomId, participants });
      }
    );

    socket.on("call:offer", (payload: { roomId?: string; sdp?: RTCSessionDescriptionInit }) => {
      if (!payload.roomId || !payload.sdp) return;
      socket.to(payload.roomId).emit("call:offer", { sdp: payload.sdp });
    });

    socket.on("call:answer", (payload: { roomId?: string; sdp?: RTCSessionDescriptionInit }) => {
      if (!payload.roomId || !payload.sdp) return;
      socket.to(payload.roomId).emit("call:answer", { sdp: payload.sdp });
    });

    socket.on("call:ice", (payload: { roomId?: string; candidate?: RTCIceCandidateInit }) => {
      if (!payload.roomId || !payload.candidate) return;
      socket.to(payload.roomId).emit("call:ice", { candidate: payload.candidate });
    });

    socket.on("call:end", (payload: { roomId?: string }) => {
      const roomId = payload.roomId || socketToCallRoom[socket.id];
      if (!roomId) return;
      socket.to(roomId).emit("call:ended");
      socket.leave(roomId);
      delete socketToCallRoom[socket.id];
    });

    // Disconnect
    socket.on("disconnect", () => {
      const roomId = socketToCallRoom[socket.id];
      if (roomId) {
        socket.to(roomId).emit("call:peer-left");
        delete socketToCallRoom[socket.id];
      }
      delete users[socket.id];
      io.emit("userList", Object.values(users).map((u) => u.name));
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
