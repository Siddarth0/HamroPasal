import mongoose, { Connection } from 'mongoose';

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined');

  const conn: Connection = mongoose.connection;

  conn.on("connected", () => console.log("✅ MongoDB connected"));
  conn.on("error", (err) => console.error("❌ MongoDB error:", err));
  conn.on("disconnected", () => console.warn("⚠️ MongoDB disconnected"));

  await mongoose.connect(uri, { dbName: 'ecommerce' });
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
