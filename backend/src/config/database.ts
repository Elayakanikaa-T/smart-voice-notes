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

    // Auto-heal legacy user accounts to ensure email_verified is true
    conn.connection.collection('users').updateMany(
      { email_verified: { $ne: true } },
      { $set: { email_verified: true } }
    ).catch(() => {});

    // Purge legacy mock/test seed accounts
    conn.connection.collection('users').deleteMany({
      $or: [
        { email: { $in: ['student@smartnotes.ai', 'alex.river@testmail.com', 'student@voice.edu'] } },
        { email: { $regex: /_1787\d+@(smartnotes\.ai|company\.com)/i } },
        { name: { $in: ['Alex Student', 'Jordan Lee', 'Jordan Employee', 'Alex River', 'Randomuser 987'] } },
      ]
    }).catch(() => {});

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
