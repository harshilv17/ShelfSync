import 'dotenv/config';
import { MongoClient, Db } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'shelfsync';

let client: MongoClient;
let db: Db;

/**
 * Connect to MongoDB. Call once at server startup.
 */
export async function connectDb(): Promise<void> {
  client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`Connected to MongoDB (${DB_NAME})`);
}

/**
 * Returns the connected Db instance.
 * Throws if called before connectDb().
 */
export function getDb(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectDb() first.');
  }
  return db;
}

/**
 * Gracefully close the MongoDB connection.
 */
export async function disconnectDb(): Promise<void> {
  if (client) {
    await client.close();
  }
}
