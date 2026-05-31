import connectToDatabase from './_utils/mongodb.js';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch all categories and products dynamically in real-time
    const categories = await db.collection('categories').find({}).toArray();
    const products = await db.collection('products').find({}).toArray();

    // Base static pages
    const staticUrls = [
      { loc: 'https://kitchub.store/', priority: '1.00', changefreq: 'daily' },
      { loc: 'https://kitchub.store/shop', priority: '0.90', changefreq: 'daily' },
      { loc: 'https://kitchub.store/about', priority: '0.60', changefreq: 'monthly' },
      { loc: 'https://kitchub.store/contact', priority: '0.60', changefreq: 'monthly' },
      { loc: 'https://kitchub.store/policies', priority: '0.40', changefreq: 'monthly' },
    ];

    // Dynamic Category URLs based on database entries
    const categoryUrls = categories.map(c => ({
      loc: `https://kitchub.store/category/${c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      priority: '0.80',
      changefreq: 'weekly'
    }));

    // Dynamic Product URLs based on database entries (prefer slug, fallback to product id)
    const productUrls = products.map(p => {
      const productSlug = p.slug || p._id.toString();
      return {
        loc: `https://kitchub.store/product/${productSlug}`,
        priority: '0.80',
        changefreq: 'weekly'
      };
    });

    const allUrls = [...staticUrls, ...categoryUrls, ...productUrls];
    const today = new Date().toISOString().split('T')[0];

    // Build the XML response body
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const url of allUrls) {
      xml += `  <url>\n`;
      xml += `    <loc>${url.loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += `  </url>\n`;
    }
    xml += `</urlset>`;

    // Set correct response headers for XML
    res.setHeader('Content-Type', 'application/xml');
    
    // Cache sitemap at Vercel's global Edge CDN for 1 hour to keep it lightning fast (sub-10ms)
    // while ensuring it refreshes every hour in the background automatically
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=600');
    
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return res.status(500).send('Error generating sitemap');
  }
}
