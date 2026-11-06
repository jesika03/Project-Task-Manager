/**
 * Database Connection File (MongoDB / Mongoose)
 * College Internal Project - Project and Task Management
 * 
 * Supports MongoDB Atlas connection string with graceful fallback
 * to a local in-memory store so the app functions 100% offline or
 * without external cluster setup.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let isUsingLocalStore = false;

const isValidMongoURI = (uri) => {
  if (!uri || typeof uri !== 'string') return false;
  const trimmed = uri.trim();
  const hasValidScheme =
    trimmed.startsWith('mongodb://') || trimmed.startsWith('mongodb+srv://');
  if (!hasValidScheme) return false;
  if (
    trimmed.includes('example.mongodb.net') ||
    trimmed.includes('<password>') ||
    trimmed.includes('MY_MONGODB_URI') ||
    trimmed.includes('YOUR_MONGODB_URI')
  ) {
    return false;
  }
  return true;
};

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!isValidMongoURI(mongoURI)) {
    console.log('[Database] Using embedded in-memory database store (Mongoose schema compliant).');
    isUsingLocalStore = true;
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    isUsingLocalStore = false;
    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch {
    console.log('[Database] Remote MongoDB not reachable, using embedded in-memory database store.');
    isUsingLocalStore = true;
    return false;
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  isUsingLocalStore: isUsingLocalStore,
  type: isConnected ? 'MongoDB Atlas (Mongoose)' : 'Local In-Memory DB (Mongoose Schema Compliant)',
});
