-- Seed categories
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Choppers',    'choppers',    'Electric and manual food choppers',         1),
  ('Blenders',    'blenders',    'High-performance blenders and mixers',      2),
  ('Knives',      'knives',      'Professional kitchen knife sets',           3),
  ('Drinkware',   'drinkware',   'Smart mugs, tumblers, and bottles',         4),
  ('Measurement', 'measurement', 'Kitchen scales and measuring tools',        5),
  ('Garden',      'garden',      'Indoor herb gardens and planters',          6)
ON CONFLICT (slug) DO NOTHING;

-- Seed products
INSERT INTO public.products
  (name, slug, price, original_price, description, short_description, images, category, rating, review_count, badge, colors, in_stock, stock_quantity, features)
VALUES
(
  'Smart Chopper Pro',
  'smart-chopper-pro',
  4500, 6500,
  'The Smart Chopper Pro revolutionizes meal prep with its powerful 500W motor and precision-engineered blades. Chop, mince, and blend in seconds. Dishwasher-safe components make cleanup a breeze.',
  'Powerful 500W food chopper with precision blades',
  ARRAY[
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&h=600&fit=crop'
  ],
  'Choppers', 4.8, 234, 'Best Seller',
  ARRAY['Silver','Black','Rose Gold'],
  true, 100,
  ARRAY['500W Motor','BPA-Free','Dishwasher Safe','5 Speed Settings']
),
(
  'Precision Kitchen Scale',
  'precision-kitchen-scale',
  2200, 3000,
  'Measure ingredients with laboratory-grade accuracy. The sleek tempered glass platform and LCD display make this scale both beautiful and functional.',
  'Digital scale with 0.1g precision accuracy',
  ARRAY[
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1495461199391-8c39ab674295?w=600&h=600&fit=crop'
  ],
  'Measurement', 4.6, 189, 'New',
  NULL,
  true, 100,
  ARRAY['0.1g Accuracy','Tempered Glass','Auto-Off','Tare Function']
),
(
  'Thermal Smart Mug',
  'thermal-smart-mug',
  3800, NULL,
  'Keep your beverages at the perfect temperature for hours. Built-in temperature control and app connectivity let you customize your drinking experience.',
  'Temperature-controlled smart mug with app',
  ARRAY[
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=600&fit=crop'
  ],
  'Drinkware', 4.7, 156, NULL,
  ARRAY['Matte Black','White','Navy'],
  true, 100,
  ARRAY['App Control','4hr Battery','LED Display','Wireless Charging']
),
(
  'AeroBlend Mixer',
  'aero-blend-mixer',
  7500, 9500,
  'Professional-grade blending power in a compact design. The AeroBlend features a vacuum blending system that preserves nutrients and reduces oxidation.',
  'Vacuum blending system for nutrient-rich smoothies',
  ARRAY[
    'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1622480916113-9000ac49b79d?w=600&h=600&fit=crop'
  ],
  'Blenders', 4.9, 312, 'Top Rated',
  ARRAY['Silver','Matte Black'],
  true, 100,
  ARRAY['Vacuum Blend','1200W Motor','Self-Cleaning','6 Programs']
),
(
  'Smart Herb Garden',
  'smart-herb-garden',
  5200, NULL,
  'Grow fresh herbs year-round with this intelligent indoor garden. Automated watering, LED grow lights, and app monitoring ensure perfect growth every time.',
  'Indoor smart garden with automated care',
  ARRAY[
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=600&fit=crop'
  ],
  'Garden', 4.5, 98, 'New',
  NULL,
  true, 100,
  ARRAY['Auto-Watering','LED Grow Lights','App Monitor','6 Pod Capacity']
),
(
  'Ceramic Knife Set',
  'ceramic-knife-set',
  6800, 8500,
  'Ultra-sharp ceramic blades that stay sharp 10x longer than steel. Lightweight, non-reactive, and perfectly balanced for effortless cutting.',
  'Premium 6-piece ceramic knife collection',
  ARRAY[
    'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1566454825481-9c31bd88e0e8?w=600&h=600&fit=crop'
  ],
  'Knives', 4.7, 267, 'Best Seller',
  ARRAY['White','Black'],
  true, 100,
  ARRAY['6 Pieces','Ceramic Blades','Ergonomic Grip','Knife Block']
)
ON CONFLICT (slug) DO NOTHING;
