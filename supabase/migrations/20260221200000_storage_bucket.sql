-- Create product-images storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Admin upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users (admins) to delete images
CREATE POLICY "Admin delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
