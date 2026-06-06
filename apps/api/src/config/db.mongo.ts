import mongoose, { Connection } from 'mongoose';
import { env } from './env';

export const connectMongo = async(): Promise<void> => {

  mongoose.connection.on("connected", () => console.log("✅ MongoDB connected"));
  mongoose.connection.on("error", (err) => console.error("❌ MongoDB error:", err));
  mongoose.connection.on("disconnected", () => console.warn("⚠️ MongoDB disconnected"));

  await mongoose.connect(env.MONGO_URI, { dbName: 'ecommerce' });
}

export const disconnectMongo = async(): Promise<void> => {
  await mongoose.disconnect();
}
