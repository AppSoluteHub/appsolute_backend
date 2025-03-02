"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = exports.io = void 0;
const socket_io_1 = require("socket.io");
const redis_1 = require("./redis");
let io;
const initializeSocket = (server) => {
    exports.io = io = new socket_io_1.Server(server, {
        cors: {
            origin: ["http://localhost:3001"],
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            credentials: true,
        },
    });
    console.log("🚀 WebSocket Server Initialized");
    // Subscribe to Redis channel
    redis_1.redisClient.subscribe("new-comment", (message) => {
        console.log("Broadcasting comment from Redis:", message);
        io.emit("receive-comment", JSON.parse(message));
    });
    io.on("connection", (socket) => {
        console.log(`🟢 User Connected: ${socket.id}`);
        socket.on("new-comment", async (comment) => {
            console.log("New comment received:", comment);
            await redis_1.redisClient.publish("new-comment", JSON.stringify(comment));
        });
        socket.on("disconnect", () => {
            console.log(`🔴 User Disconnected: ${socket.id}`);
        });
    });
};
exports.initializeSocket = initializeSocket;
