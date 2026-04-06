import 'dotenv/config';
import app from './api/app';
import { connectDb } from './infrastructure/database';

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDb();

    app.listen(port, () => {
      console.log(`LibraNet API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
