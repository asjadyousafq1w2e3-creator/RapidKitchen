import connectToDatabase from './_utils/mongodb.js';
import { ObjectId } from 'mongodb';

// 1. Categories Handler
async function categoriesHandler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();
  const cats = db.collection('categories');

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
  return res.status(405).json({ error: 'Method Not Allowed' });
}

// 2. Products Handler
async function productsHandler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();
  const products = db.collection('products');

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
    const update = { ...body };
    delete update.id;
    update.updatedAt = new Date();
    await products.updateOne({ _id: id }, { $set: update });
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
  return res.status(405).json({ error: 'Method Not Allowed' });
}

// 3. Coupons Handler
async function couponsHandler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();
  const coupons = db.collection('coupons');

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
  return res.status(405).json({ error: 'Method Not Allowed' });
}

// 4. Settings Handler
async function settingsHandler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();
  const settings = db.collection('store_settings');

  if (method === 'GET') {
    const list = await settings.find({}).toArray();
    return res.json({ settings: list.map(s => ({ key: s.key, value: s.value })) });
  }

  if (method === 'POST') {
    const body = req.body || {};
    const map = body.settings || {};
    const ops = Object.entries(map).map(([key, value]) => ({
      updateOne: { filter: { key }, update: { $set: { key, value } }, upsert: true }
    }));
    if (ops.length) await settings.bulkWrite(ops);
    return res.json({ ok: true });
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}

// Unified Router
export default async function handler(req, res) {
  const url = req.url || '';
  const pathname = new URL(url, `http://${req.headers.host || 'localhost'}`).pathname;
  const parts = pathname.split('/').filter(Boolean);
  const resource = parts[parts.length - 1]; // "categories", "products", "coupons", "settings"

  try {
    if (resource === 'categories') {
      return await categoriesHandler(req, res);
    } else if (resource === 'products') {
      return await productsHandler(req, res);
    } else if (resource === 'coupons') {
      return await couponsHandler(req, res);
    } else if (resource === 'settings') {
      return await settingsHandler(req, res);
    } else {
      return res.status(404).json({ error: `Resource not found: ${resource}` });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
