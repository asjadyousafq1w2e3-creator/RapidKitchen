import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { file } = req.body || {};
    if (!file) return res.status(400).json({ error: 'No file provided' });

    // file should be a data URL or base64 string
    const result = await cloudinary.uploader.upload(file, { folder: 'kitchub/products' });
    return res.json({ url: result.secure_url, raw: result });
  } catch (e) {
    console.error('Cloudinary upload error:', e);
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
}
