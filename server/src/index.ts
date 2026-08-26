import express from "express";
import { createServer } from "http";
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

io.on("connection", (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  socket.on("chat-message", (message: string) => {
    console.log(`💬 ${socket.id}: ${message}`);

    io.emit("chat-message", {
      id: crypto.randomUUID(),
      socketId: socket.id,
      message,
      createdAt: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 QuickChat server running on http://localhost:${PORT}`);
});