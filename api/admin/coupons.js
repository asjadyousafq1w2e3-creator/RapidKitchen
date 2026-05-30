import connectToDatabase from '../_utils/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();
  const coupons = db.collection('coupons');

  try {
    if (method === 'GET') {
      const list = await coupons.find({}).sort({ createdAt: -1 }).toArray();
      return res.json({ coupons: list.map(c => ({ ...c, id: c._id.toString() })) });
    }

    if (method === 'POST') {
      const body = req.body;
      const now = new Date();
      const doc = {
        code: String(body.code).toUpperCase(),
        type: body.discount_type || body.type || 'percentage',
        value: Number(body.discount_value || body.value) || 0,
        minOrder: Number(body.min_order_amount || body.minOrder) || 0,
        maxUses: body.max_uses ? Number(body.max_uses) : null,
        isActive: body.is_active !== undefined ? !!body.is_active : true,
        expiresAt: body.expires_at || body.expiresAt || null,
        usedCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      const r = await coupons.insertOne(doc);
      const saved = await coupons.findOne({ _id: r.insertedId });
      return res.status(201).json({ coupon: { ...saved, id: saved._id.toString() } });
    }

    if (method === 'PUT') {
      const body = req.body;
      if (body.id) {
        const id = new ObjectId(body.id);
        const update = { ...body };
        delete update.id;
        update.updatedAt = new Date();
        await coupons.updateOne({ _id: id }, { $set: update });
        const updated = await coupons.findOne({ _id: id });
        return res.json({ coupon: { ...updated, id: updated._id.toString() } });
      }
      // Toggle active if id & is_active provided
      if (body.id && body.is_active !== undefined) {
        const id = new ObjectId(body.id);
        await coupons.updateOne({ _id: id }, { $set: { isActive: !!body.is_active, updatedAt: new Date() } });
        const updated = await coupons.findOne({ _id: id });
        return res.json({ coupon: { ...updated, id: updated._id.toString() } });
      }
      return res.status(400).json({ error: 'id required' });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await coupons.deleteOne({ _id: new ObjectId(id) });
      return res.json({ ok: true });
    }

    res.setHeader('Allow', 'GET,POST,PUT,DELETE');
    res.status(405).end('Method Not Allowed');
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
