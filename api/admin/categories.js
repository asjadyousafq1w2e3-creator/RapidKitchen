import connectToDatabase from '../../api/_utils/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();
  const cats = db.collection('categories');

  try {
    if (method === 'GET') {
      const list = await cats.find({}).sort({ sort_order: 1, name: 1 }).toArray();
      return res.json({ categories: list.map(c => ({ ...c, id: c._id.toString() })) });
    }

    if (method === 'POST') {
      const body = req.body;
      const now = new Date();
      const doc = {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: body.description || "",
        image: body.image || "",
        sort_order: Number(body.sort_order) || 0,
        parent_id: body.parent_id || null,
        createdAt: now,
        updatedAt: now
      };
      const r = await cats.insertOne(doc);
      const saved = await cats.findOne({ _id: r.insertedId });
      return res.status(201).json({ category: { ...saved, id: saved._id.toString() } });
    }

    if (method === 'PUT') {
      const body = req.body;
      if (!body.id) return res.status(400).json({ error: 'id required' });
      const id = new ObjectId(body.id);
      const update = { ...body };
      delete update.id;
      update.updatedAt = new Date();
      await cats.updateOne({ _id: id }, { $set: update });
      const updated = await cats.findOne({ _id: id });
      return res.json({ category: { ...updated, id: updated._id.toString() } });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      const oid = new ObjectId(id);
      await cats.deleteOne({ _id: oid });
      return res.json({ ok: true });
    }

    res.setHeader('Allow', 'GET,POST,PUT,DELETE');
    res.status(405).end('Method Not Allowed');
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}

