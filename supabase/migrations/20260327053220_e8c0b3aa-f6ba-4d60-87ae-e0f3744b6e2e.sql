-- Create food-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true);

-- Allow authenticated users to upload food images
CREATE POLICY "Staff can upload food images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'food-images'
  AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role])
);

-- Allow anyone to view food images (public bucket)
CREATE POLICY "Anyone can view food images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'food-images');

-- Allow admins to delete food images
CREATE POLICY "Admins can delete food images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'food-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update food images
CREATE POLICY "Admins can update food images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'food-images'
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'food-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);