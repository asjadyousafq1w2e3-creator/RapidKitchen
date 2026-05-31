import connectToDatabase from './_utils/mongodb.js';
import { ObjectId } from 'mongodb';
import { getUserFromRequest } from './_utils/auth.js';
import cache from './_utils/cache.js';

export default async function handler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();
  const reviews = db.collection('reviews');

  try {
    if (method === 'GET') {
      const productId = req.query.productId;
      if (!productId) return res.json({ reviews: [] });

      // 1. Edge CDN caching headers
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=15');

      // 2. In-memory cache check
      const cacheKey = `reviews:${productId}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }

      res.setHeader('X-Cache', 'MISS');
      const list = await reviews.find({ productId }).sort({ createdAt: -1 }).toArray();
      const result = { reviews: list.map(r => ({ ...r, id: r._id.toString() })) };
      cache.set(cacheKey, result, 15); // Cache for 15s in memory
      return res.json(result);
    }

    if (method === 'POST') {
      const user = await getUserFromRequest(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const body = req.body;
      const now = new Date();
      const doc = {
        productId: body.productId,
        userId: user.id,
        userName: user.name || user.email || 'Anonymous',
        userEmail: user.email,
        rating: Number(body.rating) || 0,
        title: body.title || null,
        content: body.content || null,
        createdAt: now,
        updatedAt: now,
      };
      const r = await reviews.insertOne(doc);
      const saved = await reviews.findOne({ _id: r.insertedId });
      
      // Invalidate cache for this product
      cache.delete(`reviews:${body.productId}`);
      
      return res.status(201).json({ review: { ...saved, id: saved._id.toString() } });
    }

    if (method === 'PUT') {
      const user = await getUserFromRequest(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { id, rating, title, content } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const oid = new ObjectId(id);
      const existing = await reviews.findOne({ _id: oid });
      if (!existing) return res.status(404).json({ error: 'Not found' });
      if (existing.userId !== user.id && user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
      await reviews.updateOne({ _id: oid }, { $set: { rating: Number(rating) || existing.rating, title: title || existing.title, content: content || existing.content, updatedAt: new Date() } });
      const updated = await reviews.findOne({ _id: oid });
      
      // Invalidate cache for this product
      cache.delete(`reviews:${existing.productId}`);
      
      return res.json({ review: { ...updated, id: updated._id.toString() } });
    }

    if (method === 'DELETE') {
      const user = await getUserFromRequest(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      const oid = new ObjectId(id);
      const existing = await reviews.findOne({ _id: oid });
      if (!existing) return res.status(404).json({ error: 'Not found' });
      if (existing.userId !== user.id && user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
      await reviews.deleteOne({ _id: oid });
      
      // Invalidate cache for this product
      cache.delete(`reviews:${existing.productId}`);
      
      return res.json({ ok: true });
    }

    res.setHeader('Allow', 'GET,POST,PUT,DELETE');
    res.status(405).end('Method Not Allowed');
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
