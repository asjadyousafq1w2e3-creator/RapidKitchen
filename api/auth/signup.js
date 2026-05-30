import connectToDatabase from '../_utils/mongodb.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const existing = await users.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const now = new Date();
    const doc = { email: email.toLowerCase().trim(), passwordHash: hash, salt, name: name || null, role: 'customer', createdAt: now, updatedAt: now };
    const r = await users.insertOne(doc);
    const userId = r.insertedId.toString();
    const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
    const secure = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', `kitchub_token=${token}; Path=/; HttpOnly; SameSite=Lax; ${secure ? 'Secure;' : ''} Max-Age=${60 * 60 * 24 * 30}`);
    return res.json({ user: { id: userId, email: doc.email, name: doc.name, role: doc.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
