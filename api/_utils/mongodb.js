// MongoDB Atlas Connection Helper for RapidKitchen
import { MongoClient } from "mongodb";


const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI environment variable is required");

let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;

export async function connectToDatabase(dbName) {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName || process.env.MONGODB_DB || 'kitchub');

  global._mongoClient = client;
  global._mongoDb = db;

  return { client, db };
}

export default connectToDatabase;
