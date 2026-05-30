import connectToDatabase from '../_utils/mongodb.js';
import jwt from 'jsonwebtoken';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function buildRedirectUri(req) {
  const host = process.env.BASE_URL || `${req.headers['x-forwarded-host'] || req.headers.host}`;
  return `https://${host}/api/auth/google`;
}

export default async function handler(req, res) {
  const { query } = req;

  // If `code` present, this is the callback
  if (query && query.code) {
    const code = query.code;
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

      const resUpsert = await users.updateOne({ googleId: profile.id }, { $set: userDoc }, { upsert: true });
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

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.writeHead(302, { Location: url });
  res.end();
}
