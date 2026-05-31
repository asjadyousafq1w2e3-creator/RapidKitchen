// MongoDB Atlas Connection Helper for RapidKitchen with Connection Pooling
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI environment variable is required");

// Idempotent helper to ensure high-performance query indexes exist on active collections
async function ensureIndexes(db) {
  if (global._mongoIndexesCreated) return;
  try {
    const products = db.collection('products');
    const categories = db.collection('categories');
    const reviews = db.collection('reviews');
    const wishlists = db.collection('wishlists');

    // Optimize slug retrieval (e.g. detailed view) and sorting by creation date
    await products.createIndex({ slug: 1 }, { unique: true, sparse: true });
    await products.createIndex({ category: 1, createdAt: -1 });
    await products.createIndex({ createdAt: -1 });

    // Optimize categories sorted display
    await categories.createIndex({ slug: 1 }, { unique: true, sparse: true });
    await categories.createIndex({ sort_order: 1, name: 1 });

    // Optimize loading reviews per product
    await reviews.createIndex({ productId: 1, createdAt: -1 });

    // Optimize loading user wishlist entries and preventing duplicate items
    await wishlists.createIndex({ userId: 1, createdAt: -1 });
    await wishlists.createIndex({ userId: 1, productId: 1 }, { unique: true });

    global._mongoIndexesCreated = true;
    console.log("Database query path indexes verified successfully.");
  } catch (error) {
    console.error("Background index initialization failed:", error);
  }
}

// Check global cache to reuse connection across serverless invocations
export async function connectToDatabase(dbName) {
  if (global._mongoClient && global._mongoDb) {
    return { client: global._mongoClient, db: global._mongoDb };
  }

  // Define optimized connection options for serverless environments
  const client = new MongoClient(uri, {
    maxPoolSize: 10,             // Maintain up to 10 active socket connections
    minPoolSize: 1,              // Keep at least 1 socket connection alive
    connectTimeoutMS: 5000,      // Terminate connection attempt after 5 seconds
    socketTimeoutMS: 30000,      // Terminate socket after 30 seconds of inactivity
  });

  await client.connect();
  const db = client.db(dbName || process.env.MONGODB_DB || 'kitchub');

  // Trigger index verification in the background asynchronously
  ensureIndexes(db).catch(err => console.error("Index setup error:", err));

  // Store references in global to survive container warm cycles
  global._mongoClient = client;
  global._mongoDb = db;

  return { client, db };
}

export default connectToDatabase;
