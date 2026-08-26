import express from "express";
import { createServer } from "http";
import { randomUUID } from "node:crypto";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.get("/", (_req, res) => {
  res.json({
    message: "QuickChat server is running 🚀",
  });
});

const roomUsers = new Map<string, Map<string, string>>();

const emitRoomUsers = (room: string) => {
  const users = roomUsers.get(room);

  io.to(room).emit(
    "room-users",
    users ? Array.from(users.values()) : []
  );
};

io.on("connection", (socket) => {
  console.log(`🟢 Connected: ${socket.id}`);

  // JOIN ROOM
  socket.on(
  "join-room",
  ({ username, room }: { username: string; room: string }) => {
    const cleanUsername = username.trim();
    const cleanRoom = room.trim().toLowerCase();

    if (!cleanUsername || !cleanRoom) return;

    socket.data.username = cleanUsername;
    socket.data.room = cleanRoom;

    socket.join(cleanRoom);

    // Create room user map if it doesn't exist
    if (!roomUsers.has(cleanRoom)) {
      roomUsers.set(cleanRoom, new Map());
    }

    // Add this user using socket.id
    roomUsers
      .get(cleanRoom)!
      .set(socket.id, cleanUsername);

    console.log(`👤 ${cleanUsername} joined ${cleanRoom}`);

    io.to(cleanRoom).emit("chat-message", {
      id: randomUUID(),
      type: "system",
      message: `${cleanUsername} joined the room`,
      createdAt: new Date().toISOString(),
    });

    // Send updated online user list
    emitRoomUsers(cleanRoom);
  }
);
  // CHAT MESSAGE
  socket.on("chat-message", (message: string) => {
    const username = socket.data.username;
    const room = socket.data.room;

    if (!username || !room) return;

    const cleanMessage = message.trim();

    if (!cleanMessage) return;

    io.to(room).emit("chat-message", {
      id: randomUUID(),
      type: "chat",
      username,
      socketId: socket.id,
      message: cleanMessage,
      createdAt: new Date().toISOString(),
    });
  });

  // USER LEAVING
  socket.on("disconnecting", () => {
  const username = socket.data.username;
  const room = socket.data.room;

  if (!username || !room) return;

  const users = roomUsers.get(room);

  if (users) {
    users.delete(socket.id);

    // Remove empty room
    if (users.size === 0) {
      roomUsers.delete(room);
    }
  }

  socket.to(room).emit("chat-message", {
    id: randomUUID(),
    type: "system",
    message: `${username} left the room`,
    createdAt: new Date().toISOString(),
  });

  // Send remaining users
  emitRoomUsers(room);
});

  socket.on("disconnect", () => {
    console.log(`🔴 Disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 QuickChat server running on http://localhost:${PORT}`);
});