import connectToDatabase from '../../api/_utils/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();
  const products = db.collection('products');

  try {
    if (method === 'GET') {
      const list = await products.find({}).sort({ createdAt: -1 }).toArray();
      return res.json({ products: list.map(p => ({ ...p, id: p._id.toString() })) });
    }

    if (method === 'POST') {
      const body = req.body;
      const now = new Date();
      const doc = { ...body, createdAt: now, updatedAt: now };
      const r = await products.insertOne(doc);
      const saved = await products.findOne({ _id: r.insertedId });
      return res.status(201).json({ product: { ...saved, id: saved._id.toString() } });
    }

    if (method === 'PUT') {
      const body = req.body;
      if (!body.id) return res.status(400).json({ error: 'id required' });
      const id = new ObjectId(body.id);
      delete body.id;
      body.updatedAt = new Date();
      await products.updateOne({ _id: id }, { $set: body });
      const updated = await products.findOne({ _id: id });
      return res.json({ product: { ...updated, id: updated._id.toString() } });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      const oid = new ObjectId(id);
      await products.deleteOne({ _id: oid });
      return res.json({ ok: true });
    }

    res.setHeader('Allow', 'GET,POST,PUT,DELETE');
    res.status(405).end('Method Not Allowed');
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
