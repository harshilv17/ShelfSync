import app from './api/app';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL');

    app.listen(port, () => {
      console.log(`LibraNet API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
