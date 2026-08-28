import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

export let isMongoConnected = false;

export async function connectMongo(uriOverride?: string): Promise<typeof mongoose | null> {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uriOverride || config.mongodb.uri, {
      serverSelectionTimeoutMS: 3000,
    });
    logger.info('[MongoDB] Connected to MongoDB database successfully.');
    isMongoConnected = true;
    return conn;
  } catch (error: any) {
    logger.error(`[MongoDB] Connection failed (${error.message}). Database connection is required.`);
    isMongoConnected = false;
    throw error; // Fail fast if DB isn't connected
  }
}

export async function disconnectDatabases(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isMongoConnected = false;
  }
}

export async function cleanDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
}
