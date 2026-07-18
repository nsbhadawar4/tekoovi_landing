import dns from "node:dns";
import mongoose from "mongoose";


type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongooseCache: Cache | undefined;
}

const cache: Cache = globalThis._mongooseCache ?? { conn: null, promise: null };
globalThis._mongooseCache = cache;

/**
 * A `mongodb+srv://` URI needs a DNS SRV lookup to find the cluster nodes.
 * Some local / corporate / ISP resolvers intermittently refuse SRV queries
 * (`querySrv ECONNREFUSED`), which makes the whole connection — and therefore
 * every admin save — fail. Keep the system resolvers as primary but append
 * reliable public resolvers as a fallback so a flaky DNS can't take writes down.
 * Runs once per process; best-effort (never throws).
 */
let dnsFallbackApplied = false;
function ensureDnsFallback(): void {
  if (dnsFallbackApplied) return;
  dnsFallbackApplied = true;
  try {
    const servers = [...new Set([...dns.getServers(), "1.1.1.1", "8.8.8.8"])];
    dns.setServers(servers);
  } catch {
    try {
      dns.setServers(["1.1.1.1", "8.8.8.8"]);
    } catch {
      /* keep the system resolver as-is */
    }
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (cache.conn) return cache.conn;
  ensureDnsFallback();
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { bufferCommands: false });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    // Don't let a failed attempt poison the cache — clear it so the next
    // request retries instead of re-awaiting the same rejected promise.
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
