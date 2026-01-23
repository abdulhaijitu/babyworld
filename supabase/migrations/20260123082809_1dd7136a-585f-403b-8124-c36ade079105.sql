-- Create storage bucket for ride images
INSERT INTO storage.buckets (id, name, public) VALUES ('ride-images', 'ride-images', true);

-- Create storage policies for ride images
CREATE POLICY "Anyone can view ride images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ride-images');

CREATE POLICY "Admins can upload ride images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ride-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ride images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ride-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ride images"
ON storage.objects FOR DELETE
USING (bucket_id = 'ride-images' AND has_role(auth.uid(), 'admin'));

-- Add image_url column to rides table
ALTER TABLE public.rides ADD COLUMN image_url TEXT;