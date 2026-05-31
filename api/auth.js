import connectToDatabase from './_utils/mongodb.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

function buildRedirectUri(req) {
  const host = process.env.BASE_URL || `${req.headers['x-forwarded-host'] || req.headers.host}`;
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('8080');
  
  if (isLocal) {
    return 'http://localhost:8080/oauth2callback';
  }
  // Force the exact whitelisted URI in production to completely prevent redirect_uri_mismatch
  return 'https://www.kitchub.store/oauth2callback';
}

// 1. Signin Handler
async function signinHandler(req, res) {
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

// 2. Signup Handler
async function signupHandler(req, res) {
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

// 3. Me Handler
async function meHandler(req, res) {
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

// 4. Signout Handler
function signoutHandler(req, res) {
  res.setHeader('Set-Cookie', `kitchub_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  return res.json({ ok: true });
}

// 5. Google OAuth Handler
async function googleHandler(req, res) {
  const url = req.url || '';
  const parsedUrl = new URL(url, `http://${req.headers.host || 'localhost'}`);
  const code = parsedUrl.searchParams.get('code');

  if (code) {
    try {
      const redirect_uri = process.env.GOOGLE_REDIRECT_URI || buildRedirectUri(req);

      const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenJson = await tokenResp.json();
      if (tokenJson.error) throw new Error(tokenJson.error_description || tokenJson.error);

      const userinfoResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      });
      const profile = await userinfoResp.json();

      const { db } = await connectToDatabase();
      const users = db.collection('users');

      const existing = await users.findOne({ googleId: profile.id });
      const now = new Date();
      const userDoc = {
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
        googleId: profile.id,
        picture: profile.picture,
        role: existing?.role || 'customer',
        updatedAt: now,
        createdAt: existing?.createdAt || now,
      };

      await users.updateOne({ googleId: profile.id }, { $set: userDoc }, { upsert: true });
      const user = await users.findOne({ googleId: profile.id });

      const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

      // Set cookie
      const cookie = `kitchub_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
      res.setHeader('Set-Cookie', cookie);

      // Redirect to homepage or account
      res.writeHead(302, { Location: process.env.FRONTEND_URL || '/' });
      res.end();
    } catch (e) {
      console.error('Google OAuth error:', e);
      res.status(500).send('Authentication failed');
    }
    return;
  }

  // Start OAuth flow
  const redirect_uri = process.env.GOOGLE_REDIRECT_URI || buildRedirectUri(req);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.writeHead(302, { Location: redirectUrl });
  res.end();
}

// Unified Router
export default async function handler(req, res) {
  const url = req.url || '';
  const pathname = new URL(url, `http://${req.headers.host || 'localhost'}`).pathname;
  const parts = pathname.split('/').filter(Boolean);
  const action = parts[parts.length - 1]; // "signin", "signup", "me", "signout", "google"

  if (pathname === '/oauth2callback' || action === 'google') {
    return googleHandler(req, res);
  } else if (action === 'signin') {
    return signinHandler(req, res);
  } else if (action === 'signup') {
    return signupHandler(req, res);
  } else if (action === 'me') {
    return meHandler(req, res);
  } else if (action === 'signout') {
    return signoutHandler(req, res);
  } else {
    return res.status(404).json({ error: `Not found: ${action}` });
  }
}
