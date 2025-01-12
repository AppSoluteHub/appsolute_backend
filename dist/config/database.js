"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Create an instance of PrismaClient
const prisma = new client_1.PrismaClient();
// export type { User, BlacklistedToken, ArtistProfile };
exports.default = prisma;
