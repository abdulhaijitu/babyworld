-- Create ride category enum
CREATE TYPE public.ride_category AS ENUM ('kids', 'family', 'thrill');

-- Add category column to rides table
ALTER TABLE public.rides 
ADD COLUMN category ride_category NOT NULL DEFAULT 'kids';

-- Update existing rides with categories
UPDATE public.rides SET category = 'kids' WHERE name IN ('Ball Pit', 'Kiddie Train', 'Jumping Castle');
UPDATE public.rides SET category = 'family' WHERE name IN ('Carousel', 'Mini Train', 'Swing Ride', 'Ferris Wheel');
UPDATE public.rides SET category = 'thrill' WHERE name IN ('Slide Adventure', 'Trampoline', 'Bumper Cars');