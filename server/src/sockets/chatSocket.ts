import { Server, Socket } from "socket.io";

interface User {
  id: string;
  name: string;
}

const users: Record<string, User> = {};

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

    // Disconnect
    socket.on("disconnect", () => {
      delete users[socket.id];
      io.emit("userList", Object.values(users).map((u) => u.name));
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
