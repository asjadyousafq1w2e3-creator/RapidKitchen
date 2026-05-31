import connectToDatabase from './_utils/mongodb.js';
import { ObjectId } from 'mongodb';
import { getUserFromRequest } from './_utils/auth.js';

export default async function handler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();
  const wishlists = db.collection('wishlists');
  const products = db.collection('products');

  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (method === 'GET') {
      const list = await wishlists.find({ userId: user.id }).sort({ createdAt: -1 }).toArray();
      const productIds = list.map((w) => new ObjectId(w.productId));
      const prods = productIds.length ? await products.find({ _id: { $in: productIds } }).toArray() : [];
      const map = prods.reduce((acc, p) => { acc[p._id.toString()] = p; return acc; }, {});
      const enriched = list.map(w => ({ ...w, id: w._id.toString(), products: map[w.productId] ? [map[w.productId]] : [], product: map[w.productId] || null }));
      return res.json({ wishlists: enriched });
    }

    if (method === 'POST') {
      const { productId } = req.body || {};
      if (!productId) return res.status(400).json({ error: 'productId required' });
      const now = new Date();
      const doc = { userId: user.id, productId, createdAt: now };
      const r = await wishlists.insertOne(doc);
      const saved = await wishlists.findOne({ _id: r.insertedId });
      return res.status(201).json({ wishlist: { ...saved, id: saved._id.toString() } });
    }

    if (method === 'DELETE') {
      const body = req.body || {};
      const id = body.id || req.query.id;
      if (!id) return res.status(400).json({ error: 'id required' });
      const oid = new ObjectId(id);
      const existing = await wishlists.findOne({ _id: oid });
      if (!existing) return res.status(404).json({ error: 'Not found' });
      if (existing.userId !== user.id) return res.status(403).json({ error: 'Forbidden' });
      await wishlists.deleteOne({ _id: oid });
      return res.json({ ok: true });
    }

    res.setHeader('Allow', 'GET,POST,DELETE');
    res.status(405).end('Method Not Allowed');
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
