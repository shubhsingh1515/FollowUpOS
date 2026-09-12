import dns from 'dns';
import mongoose from 'mongoose';
import { config } from './config.js';
import { logger } from '../utils/logger.js';

// Resolve MongoDB Atlas SRV records reliably across Windows and ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (err) {
  // Ignore if DNS server override is restricted
}

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) return;

  mongoose.set('bufferCommands', false);

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });

    isConnected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    // Create indexes after connection
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

  } catch (error) {
    isConnected = false;
    try { await mongoose.disconnect(); } catch {}
    throw error;
  }
}

export function getDatabaseStatus() {
  return {
    connected: isConnected,
    state: mongoose.connection.readyState,
  };
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    isConnected = false;
  } catch {}
}

export default connectDatabase;
