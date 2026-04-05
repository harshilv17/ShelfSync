import { PrismaClient } from '@prisma/client';

// Singleton instance
export const prisma = new PrismaClient();
