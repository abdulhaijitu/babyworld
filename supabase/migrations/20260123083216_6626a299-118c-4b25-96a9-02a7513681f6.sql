-- Create ride_reviews table for rating and review system
CREATE TABLE public.ride_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_phone TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ride_reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved reviews
CREATE POLICY "Anyone can view approved reviews"
ON public.ride_reviews
FOR SELECT
USING (is_approved = true);

-- Allow admins to manage all reviews
CREATE POLICY "Admins can manage reviews"
ON public.ride_reviews
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'manager')
  )
);

-- Allow anyone to insert reviews (for public submission)
CREATE POLICY "Anyone can submit reviews"
ON public.ride_reviews
FOR INSERT
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_ride_reviews_updated_at
BEFORE UPDATE ON public.ride_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add average rating column to rides table for quick access
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_reviews;