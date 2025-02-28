import { Server } from "socket.io";
import { redisClient } from "./redis";

let io: Server;

const initializeSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3001"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  console.log("🚀 WebSocket Server Initialized");

  // Subscribe to Redis channel
  redisClient.subscribe("new-comment", (message) => {
    console.log("Broadcasting comment from Redis:", message);
    io.emit("receive-comment", JSON.parse(message));
  });

  io.on("connection", (socket) => {
    console.log(`🟢 User Connected: ${socket.id}`);

    socket.on("new-comment", async (comment) => {
      console.log("New comment received:", comment);
      await redisClient.publish("new-comment", JSON.stringify(comment));
    });

    socket.on("disconnect", () => {
      console.log(`🔴 User Disconnected: ${socket.id}`);
    });
  });
};

export { io, initializeSocket };
