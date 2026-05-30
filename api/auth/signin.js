import connectToDatabase from '../_utils/mongodb.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const user = await users.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.salt || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
    const hash = crypto.scryptSync(password, user.salt, 64).toString('hex');
    if (hash !== user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
    const userId = user._id.toString();
    const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
    const secure = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', `kitchub_token=${token}; Path=/; HttpOnly; SameSite=Lax; ${secure ? 'Secure;' : ''} Max-Age=${60 * 60 * 24 * 30}`);
    return res.json({ user: { id: userId, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
