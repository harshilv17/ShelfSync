import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

/**
 * Connects to MongoDB using MONGO_URL and MONGO_DB_NAME from env.
 * Must be called once at server startup before any repository access.
 */
export async function connectDb(): Promise<void> {
  const url = process.env.MONGO_URL;
  const dbName = process.env.MONGO_DB_NAME;

  if (!url || !dbName) {
    throw new Error('MONGO_URL and MONGO_DB_NAME must be set in .env');
  }

  client = new MongoClient(url);
  await client.connect();
  db = client.db(dbName);
}

/**
 * Returns the MongoDB Db instance. Throws if connectDb() has not been called.
 */
export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized — call connectDb() first');
  }
  return db;
}

/**
 * Gracefully closes the MongoDB connection.
 */
export async function disconnectDb(): Promise<void> {
  if (client) {
    await client.close();
  }
}
