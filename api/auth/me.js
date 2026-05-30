import connectToDatabase from '../_utils/mongodb.js';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export default async function handler(req, res) {
  try {
    const cookie = req.headers.cookie || '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('kitchub_token='));
    if (!match) return res.json({ user: null });

    const token = match.split('=')[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.json({ user: null });
    }

    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(payload.sub) });
    if (!user) return res.json({ user: null });

    const userOut = { id: user._id.toString(), email: user.email, name: user.name, role: user.role, picture: user.picture };
    res.json({ user: userOut });
  } catch (e) {
    console.error(e);
    res.status(500).json({ user: null });
  }
}
