
-- Create a public-safe view for ride_reviews that excludes phone numbers
CREATE OR REPLACE VIEW public.ride_reviews_public
WITH (security_invoker = on) AS
  SELECT id, ride_id, rating, reviewer_name, review_text, is_approved, created_at, updated_at
  FROM public.ride_reviews;

-- Drop old public policy and replace with one that denies direct public access for non-staff
DROP POLICY IF EXISTS "Anyone can view approved reviews without phone" ON public.ride_reviews;
CREATE POLICY "Public can view approved reviews"
  ON public.ride_reviews FOR SELECT
  TO public
  USING (
    is_approved = true 
    AND (
      auth.uid() IS NULL 
      OR NOT has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role])
    )
  );
