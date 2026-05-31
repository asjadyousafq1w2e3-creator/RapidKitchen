import connectToDatabase from './_utils/mongodb.js';
import { ObjectId } from 'mongodb';
import cache from './_utils/cache.js';

export default async function handler(req, res) {
  const { method } = req;
  
  try {
    if (method === 'GET') {
      // 1. Return Edge CDN Caching Headers (Cache at edge for 15s, allow stale serve up to 30s during bg refresh)
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=15, stale-while-revalidate=30');

      // 2. Check Serverless In-Memory Cache
      const cacheKey = `products:${JSON.stringify(req.query)}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }

      res.setHeader('X-Cache', 'MISS');
      const { db } = await connectToDatabase();
      const products = db.collection('products');
      const { id, slug, limit, category, q } = req.query;

      if (slug) {
        const p = await products.findOne({ slug: String(slug) });
        const result = { product: p ? { ...p, id: p._id.toString() } : null };
        cache.set(cacheKey, result, 30); // Cache in memory for 30s
        return res.json(result);
      }
      
      if (id) {
        const p = await products.findOne({ _id: new ObjectId(String(id)) });
        const result = { product: p ? { ...p, id: p._id.toString() } : null };
        cache.set(cacheKey, result, 30); // Cache in memory for 30s
        return res.json(result);
      }

      const qFilter = {};
      if (category) qFilter.category = category;
      if (q) qFilter.$or = [ { name: { $regex: q, $options: 'i' } }, { short_description: { $regex: q, $options: 'i' } } ];

      const lim = limit ? parseInt(limit, 10) : 50;
      const list = await products.find(qFilter).sort({ createdAt: -1 }).limit(lim).toArray();
      const result = { products: list.map(p => ({ ...p, id: p._id.toString() })) };
      cache.set(cacheKey, result, 30); // Cache in memory for 30s
      return res.json(result);
    }

    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
