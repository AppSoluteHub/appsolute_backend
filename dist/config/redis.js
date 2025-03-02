"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)();
exports.redisClient = redisClient;
redisClient.on("error", (err) => console.error("Redis Client Error", err));
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("✅ Connected to Redis");
    }
    catch (error) {
        console.error("❌ Redis Connection Error:", error);
    }
};
exports.connectRedis = connectRedis;
