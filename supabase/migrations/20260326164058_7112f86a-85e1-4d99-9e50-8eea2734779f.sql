
-- Add image_url column to hero_cards
ALTER TABLE public.hero_cards ADD COLUMN image_url text;

-- Create storage bucket for hero card images
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-images', 'hero-images', true);

-- Allow anyone to view hero images
CREATE POLICY "Anyone can view hero images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hero-images');

-- Admins can upload hero images
CREATE POLICY "Admins can upload hero images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hero-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Admins can update hero images
CREATE POLICY "Admins can update hero images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hero-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete hero images
CREATE POLICY "Admins can delete hero images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hero-images' AND has_role(auth.uid(), 'admin'::app_role));
