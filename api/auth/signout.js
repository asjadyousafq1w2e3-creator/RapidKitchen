export default function handler(req, res) {
  // Clear the cookie
  res.setHeader('Set-Cookie', `kitchub_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  res.json({ ok: true });
}
