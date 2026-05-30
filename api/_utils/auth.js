import jwt from 'jsonwebtoken';
import connectToDatabase from './mongodb.js';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export async function getUserFromRequest(req) {
  try {
    const cookie = req.headers.cookie || '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('kitchub_token='));
    if (!match) return null;
    const token = match.split('=')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(String(payload.sub)) });
    if (!user) return null;
    return { id: user._id.toString(), email: user.email, role: user.role, name: user.name };
  } catch (e) {
    return null;
  }
}

export default getUserFromRequest;
