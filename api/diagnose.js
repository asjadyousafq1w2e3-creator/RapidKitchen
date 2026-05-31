import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  const diagnostics = {
    env: {
      MONGODB_URI_present: !!process.env.MONGODB_URI,
      MONGODB_DB_present: !!process.env.MONGODB_DB,
      GOOGLE_CLIENT_ID_present: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET_present: !!process.env.GOOGLE_CLIENT_SECRET,
      JWT_SECRET_present: !!process.env.JWT_SECRET,
    },
    databaseConnection: null,
  };

  if (!process.env.MONGODB_URI) {
    diagnostics.databaseConnection = {
      status: 'Failed',
      error: 'MONGODB_URI is missing from Vercel environment variables'
    };
    return res.json(diagnostics);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    const start = Date.now();
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'kitchub');
    const collections = await db.listCollections().toArray();
    diagnostics.databaseConnection = {
      status: 'Connected successfully',
      latencyMs: Date.now() - start,
      databaseName: process.env.MONGODB_DB || 'kitchub',
      collections: collections.map(c => c.name),
    };
  } catch (e) {
    diagnostics.databaseConnection = {
      status: 'Failed to connect',
      error: e.message || String(e),
      stack: e.stack || null,
      tip: e.message.includes('ServerSelectionError') 
        ? 'This typically means MongoDB Atlas is blocking Vercel. Please check your Atlas IP Access List (whitelist 0.0.0.0/0).'
        : 'Check your database connection credentials.'
    };
  } finally {
    try {
      await client.close();
    } catch (err) {}
  }

  return res.json(diagnostics);
}
