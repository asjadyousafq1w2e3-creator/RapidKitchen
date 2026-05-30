import connectToDatabase from './_utils/mongodb.js';
import sendResendEmail from './_utils/sendEmail.js';
import { ObjectId } from 'mongodb';
import { getUserFromRequest } from './_utils/auth.js';

export default async function handler(req, res) {
  const method = req.method;
  if (method === 'GET') {
    // return orders for current user or all if admin
    const user = await getUserFromRequest(req);
    const { db } = await connectToDatabase();
    const orders = db.collection('orders');
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.role === 'admin') {
      const list = await orders.find({}).sort({ createdAt: -1 }).toArray();
      return res.json({ orders: list.map(o => ({ ...o, id: o._id.toString() })) });
    }
    const list = await orders.find({ 'user.id': user.id }).sort({ createdAt: -1 }).toArray();
    return res.json({ orders: list.map(o => ({ ...o, id: o._id.toString() })) });
  }

  if (method === 'PUT') {
    // admin updating order status
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: 'id and status required' });
    const { db } = await connectToDatabase();
    const orders = db.collection('orders');
    await orders.updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt: new Date() } });
    const updated = await orders.findOne({ _id: new ObjectId(id) });
    // optionally send status update email
    try {
      const html = `<h3>Order #${id} status updated to ${status}</h3>`;
      await sendResendEmail({ to: updated.user?.email || updated.shipping?.email, subject: `Kitchub Order ${status}`, html });
    } catch (e) {
      console.error('Failed to send status email:', e);
    }
    return res.json({ order: { ...updated, id: updated._id.toString() } });
  }

  if (method !== 'POST') {
    res.status(405).setHeader('Allow', 'GET,POST,PUT').json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body || JSON.parse(req.rawBody || '{}');
    const { items, user, shipping, total } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Invalid order items' });
      return;
    }

    const { db } = await connectToDatabase();
    const orders = db.collection('orders');

    const order = {
      items,
      user: user || null,
      shipping: shipping || null,
      total: total || items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await orders.insertOne(order);
    const savedRaw = await orders.findOne({ _id: result.insertedId });
    const saved = { ...savedRaw, _id: result.insertedId.toString() };

    // send confirmation email via Resend
    try {
      const html = `
        <h1>Order Confirmation - Kitchub</h1>
        <p>Order ID: ${saved._id}</p>
        <p>Total: ${saved.total}</p>
        <h3>Items</h3>
        <ul>
          ${saved.items.map(i => `<li>${i.name} x ${i.qty} — ${i.price}</li>`).join('')}
        </ul>
      `;

      await sendResendEmail({ to: saved.user?.email || shipping?.email, subject: 'Kitchub Order Confirmation', html });
    } catch (e) {
      console.error('Failed to send order email:', e.message || e);
    }

    res.status(201).json({ order: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
