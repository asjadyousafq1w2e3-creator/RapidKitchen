import connectToDatabase from '../_utils/mongodb.js';

export default async function handler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();
  const settings = db.collection('store_settings');

  try {
    if (method === 'GET') {
      const list = await settings.find({}).toArray();
      return res.json({ settings: list.map(s => ({ key: s.key, value: s.value })) });
    }

    if (method === 'POST') {
      const body = req.body || {};
      const map = body.settings || {};
      const ops = Object.entries(map).map(([key, value]) => ({ updateOne: { filter: { key }, update: { $set: { key, value } }, upsert: true } }));
      if (ops.length) await settings.bulkWrite(ops);
      return res.json({ ok: true });
    }

    res.setHeader('Allow', 'GET,POST');
    res.status(405).end('Method Not Allowed');
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
