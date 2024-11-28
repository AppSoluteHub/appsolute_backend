import { PrismaClient } from "@prisma/client";

// Create an instance of PrismaClient
const prisma = new PrismaClient();

// export type { User, BlacklistedToken, ArtistProfile };
export default prisma;
