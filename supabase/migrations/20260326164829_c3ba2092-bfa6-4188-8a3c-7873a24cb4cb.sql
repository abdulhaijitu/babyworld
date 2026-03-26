
-- Add expires_at column to hero_cards
ALTER TABLE public.hero_cards ADD COLUMN expires_at timestamptz;

-- Drop the old SELECT policy and recreate with expiry check
DROP POLICY "Anyone can view active hero cards" ON public.hero_cards;

CREATE POLICY "Anyone can view active non-expired hero cards"
ON public.hero_cards FOR SELECT TO public
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
