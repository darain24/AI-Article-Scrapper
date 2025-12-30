import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma client
// Prevents multiple instances in development with hot-reload
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

