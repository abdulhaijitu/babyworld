
-- Create hero_cards table for dynamic offer and event cards
CREATE TABLE public.hero_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'offer' CHECK (type IN ('offer', 'event')),
  badge text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  cta_text text NOT NULL DEFAULT 'Learn More',
  cta_link text NOT NULL DEFAULT '/',
  date_text text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_cards ENABLE ROW LEVEL SECURITY;

-- Anyone can view active hero cards
CREATE POLICY "Anyone can view active hero cards"
ON public.hero_cards FOR SELECT
TO public
USING (is_active = true);

-- Admins can manage hero cards
CREATE POLICY "Admins can manage hero cards"
ON public.hero_cards FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default cards
INSERT INTO public.hero_cards (type, badge, title, description, cta_text, cta_link, sort_order) VALUES
('offer', 'Eid Special!', '15% Off Birthday Parties', 'Book birthday parties for Eid holidays and get 15% off all packages. Limited time offer!', 'Book Now', '/play-booking', 1),
('event', 'Upcoming', 'Eid Carnival 2026', 'Join us for a fun-filled Eid carnival with games, rides, and special surprises for all kids!', 'Learn More', '/birthday-events', 2);
