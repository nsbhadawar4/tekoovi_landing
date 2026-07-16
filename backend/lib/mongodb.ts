import mongoose from "mongoose";

/* -------------------------------------------------------------- */
/*  MongoDB connection — cached for serverless.                    */
/*                                                                 */
/*  On Vercel each request may run in a fresh (or warm) lambda.    */
/*  We cache the connection on globalThis so warm invocations and  */
/*  Next.js hot-reloads reuse a single connection instead of       */
/*  opening a new one every time. Nothing runs at import time, so  */
/*  it's safe to import even when MONGODB_URI is unset (local dev  */
/*  falls back to the JSON file store).                            */
/* -------------------------------------------------------------- */

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongooseCache: Cache | undefined;
}

const cache: Cache = globalThis._mongooseCache ?? { conn: null, promise: null };
globalThis._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { bufferCommands: false });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
