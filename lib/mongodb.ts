import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('请在 .env.local 中设置 MONGODB_URI')
}

interface CachedConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalWithMongoose = global as typeof globalThis & {
  mongoose: CachedConnection
}

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null }
}

const cached = globalWithMongoose.mongoose

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI)
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect
