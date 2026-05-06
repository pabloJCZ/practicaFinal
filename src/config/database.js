import mongoose from 'mongoose';
import { config } from './index.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error conectando a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export const getDBStatus = () => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  return states[mongoose.connection.readyState] || 'unknown';
};
