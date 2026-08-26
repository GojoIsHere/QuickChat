import express from "express";
import { createServer } from "http";
import { randomUUID } from "node:crypto";
import { Server } from "socket.io";
import cors from "cors";
import {
  createMessage,
  getOrCreateRoom,
  getRecentMessages,
} from "./db/queries.js";

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
  async ({
    username,
    room,
  }: {
    username: string;
    room: string;
  }) => {
    try {
      const cleanUsername = username.trim();
      const cleanRoom = room.trim().toLowerCase();

      if (!cleanUsername || !cleanRoom) return;

      // 1. Find or create the PostgreSQL room
      const databaseRoom = await getOrCreateRoom(cleanRoom);

      if (!databaseRoom) {
        throw new Error("Could not create or find room");
      }

      // 2. Store user/room info on the socket
      socket.data.username = cleanUsername;
      socket.data.room = cleanRoom;
      socket.data.roomId = databaseRoom.id;

      // 3. Join Socket.IO room
      socket.join(cleanRoom);

      // 4. Load previous messages from PostgreSQL
      const history = await getRecentMessages(
        databaseRoom.id,
        50
      );

      // 5. Send history ONLY to the person joining
      socket.emit(
        "message-history",
        history.map((item) => ({
          id: item.id,
          type: "chat",
          username: item.username,
          message: item.content,
          createdAt: item.createdAt.toISOString(),
        }))
      );

      // 6. Online-user tracking
      if (!roomUsers.has(cleanRoom)) {
        roomUsers.set(cleanRoom, new Map());
      }

      roomUsers
        .get(cleanRoom)!
        .set(socket.id, cleanUsername);

      console.log(
        `👤 ${cleanUsername} joined ${cleanRoom}`
      );

      // 7. Join notification
      io.to(cleanRoom).emit("chat-message", {
        id: randomUUID(),
        type: "system",
        message: `${cleanUsername} joined the room`,
        createdAt: new Date().toISOString(),
      });

      emitRoomUsers(cleanRoom);
    } catch (error) {
      console.error("❌ Failed to join room:", error);
    }
  }
);

  // CHAT MESSAGE
  socket.on("chat-message", async (message: string) => {
  try {
    const username = socket.data.username;
    const room = socket.data.room;
    const roomId = socket.data.roomId;

    if (!username || !room || !roomId) return;

    const cleanMessage = message.trim();

    if (!cleanMessage) return;

    // SAVE FIRST
    const savedMessage = await createMessage({
      roomId,
      username,
      content: cleanMessage,
    });

    // THEN BROADCAST
    io.to(room).emit("chat-message", {
      id: savedMessage.id,
      type: "chat",
      username: savedMessage.username,
      socketId: socket.id,
      message: savedMessage.content,
      createdAt: savedMessage.createdAt.toISOString(),
    });

    console.log(
      `💾 ${username} saved message in ${room}`
    );
  } catch (error) {
    console.error("❌ Failed to save message:", error);
  }
  });

  // TYPING INDICATOR
  socket.on("typing", () => {
  const username = socket.data.username;
  const room = socket.data.room;

  if (!username || !room) return;

  socket.to(room).emit("user-typing", username);
});

socket.on("stop-typing", () => {
  const username = socket.data.username;
  const room = socket.data.room;

  if (!username || !room) return;

  socket.to(room).emit("user-stop-typing", username);
});

// Leave room
socket.on("leave-room", (callback) => {
  const username = socket.data.username;
  const room = socket.data.room;

  if (!username || !room) {
    callback?.();
    return;
  }

  const users = roomUsers.get(room);

  if (users) {
    users.delete(socket.id);

    if (users.size === 0) {
      roomUsers.delete(room);
    }
  }

  // Remove socket from the Socket.IO room
  socket.leave(room);

  // Tell everyone still inside
  io.to(room).emit("chat-message", {
    id: randomUUID(),
    type: "system",
    message: `${username} left the room`,
    createdAt: new Date().toISOString(),
  });

  // Update online users
  emitRoomUsers(room);

  console.log(`👋 ${username} left ${room}`);

  // IMPORTANT:
  // Clearing this so disconnecting doesn't announce
  // the user leaving a second time.
  socket.data.username = undefined;
  socket.data.room = undefined;
  socket.data.roomId = undefined;

  callback?.();
});


  // USER LEAVING
socket.on("disconnecting", () => {
  const username = socket.data.username;
  const room = socket.data.room;

  if (!username || !room) return;

  const users = roomUsers.get(room);

  if (users) {
    users.delete(socket.id);

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

  emitRoomUsers(room);
});

  socket.on("disconnect", () => {
    console.log(`🔴 Disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 QuickChat server running on http://localhost:${PORT}`);
});