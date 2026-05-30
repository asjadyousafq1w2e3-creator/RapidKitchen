import connectToDatabase from './_utils/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();
  const products = db.collection('products');

  try {
    if (method === 'GET') {
      const { id, slug, limit, category, q } = req.query;
      if (slug) {
        const p = await products.findOne({ slug: String(slug) });
        return res.json({ product: p ? { ...p, id: p._id.toString() } : null });
      }
      if (id) {
        const p = await products.findOne({ _id: new ObjectId(String(id)) });
        return res.json({ product: p ? { ...p, id: p._id.toString() } : null });
      }

      const qFilter = {};
      if (category) qFilter.category = category;
      if (q) qFilter.$or = [ { name: { $regex: q, $options: 'i' } }, { short_description: { $regex: q, $options: 'i' } } ];

      const lim = limit ? parseInt(limit, 10) : 50;
      const list = await products.find(qFilter).sort({ createdAt: -1 }).limit(lim).toArray();
      return res.json({ products: list.map(p => ({ ...p, id: p._id.toString() })) });
    }

    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
