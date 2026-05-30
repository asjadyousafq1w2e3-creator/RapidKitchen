import connectToDatabase from '../_utils/mongodb.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { code, order_total } = req.body || {};
    if (!code) return res.status(400).json({ error: 'code required' });

    const { db } = await connectToDatabase();
    const coupons = db.collection('coupons');
    const coupon = await coupons.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.json({ valid: false, error: 'Coupon not found' });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return res.json({ valid: false, error: 'Coupon expired' });
    if (coupon.minOrder && order_total < coupon.minOrder) return res.json({ valid: false, error: 'Order does not meet minimum for this coupon' });

    // Compute discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((coupon.value / 100) * order_total);
    } else {
      discount = coupon.value;
    }

    res.json({ valid: true, discount, discount_type: coupon.type, discount_value: coupon.value });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
