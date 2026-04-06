import app from './api/app';
import { connectDb } from './infrastructure/database';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDb();
    console.log(`Connected to MongoDB (${process.env.MONGO_DB_NAME})`);

    app.listen(port, () => {
      console.log(`LibraNet API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
