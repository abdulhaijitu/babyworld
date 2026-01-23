-- Create membership_type enum
CREATE TYPE public.membership_type AS ENUM ('monthly', 'quarterly', 'yearly');

-- Create membership_status enum
CREATE TYPE public.membership_status AS ENUM ('active', 'expired', 'cancelled');

-- Create memberships table
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  child_count INTEGER NOT NULL DEFAULT 1,
  membership_type membership_type NOT NULL,
  status membership_status NOT NULL DEFAULT 'active',
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_till DATE NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 100, -- 100 = free entry, 50 = 50% off
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create rides/add-ons table
CREATE TABLE public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_bn TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ticket_rides junction table for rides added to tickets
CREATE TABLE public.ticket_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new columns to tickets table for counter tickets
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS guardian_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS child_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS socks_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS socks_price NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS entry_price NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS addons_price NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS in_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS out_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS membership_id UUID REFERENCES public.memberships(id),
  ADD COLUMN IF NOT EXISTS discount_applied NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Enable RLS on new tables
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_rides ENABLE ROW LEVEL SECURITY;

-- RLS policies for memberships
CREATE POLICY "Admins and managers can manage memberships"
  ON public.memberships FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Staff can view memberships"
  ON public.memberships FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role]));

-- RLS policies for rides
CREATE POLICY "Admins can manage rides"
  ON public.rides FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active rides"
  ON public.rides FOR SELECT
  USING (true);

-- RLS policies for ticket_rides
CREATE POLICY "Staff can manage ticket rides"
  ON public.ticket_rides FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role]));

-- Triggers for updated_at
CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rides_updated_at
  BEFORE UPDATE ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for phone lookup on memberships
CREATE INDEX idx_memberships_phone ON public.memberships(phone);
CREATE INDEX idx_memberships_status ON public.memberships(status);
CREATE INDEX idx_ticket_rides_ticket_id ON public.ticket_rides(ticket_id);