-- Create enum for slot status
CREATE TYPE public.slot_status AS ENUM ('available', 'booked');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('confirmed', 'pending', 'cancelled');

-- Create enum for booking type
CREATE TYPE public.booking_type AS ENUM ('hourly_play', 'birthday_event', 'private_event');

-- Create enum for ticket type
CREATE TYPE public.ticket_type AS ENUM ('child_guardian', 'child_only', 'group');

-- Create slots table
CREATE TABLE public.slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status public.slot_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(slot_date, time_slot)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES public.slots(id) ON DELETE SET NULL,
  slot_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  booking_type public.booking_type NOT NULL DEFAULT 'hourly_play',
  ticket_type public.ticket_type NOT NULL DEFAULT 'child_guardian',
  status public.booking_status NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster slot lookups
CREATE INDEX idx_slots_date ON public.slots(slot_date);
CREATE INDEX idx_slots_date_status ON public.slots(slot_date, status);
CREATE INDEX idx_bookings_date ON public.bookings(slot_date);
CREATE INDEX idx_bookings_phone ON public.bookings(parent_phone);

-- Enable RLS on both tables
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for slots (public read, no direct write from frontend)
CREATE POLICY "Anyone can view slots"
  ON public.slots
  FOR SELECT
  USING (true);

-- RLS Policies for bookings (public read for now, no direct write)
CREATE POLICY "Anyone can view bookings"
  ON public.bookings
  FOR SELECT
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_slots_updated_at
  BEFORE UPDATE ON public.slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for slots table
ALTER PUBLICATION supabase_realtime ADD TABLE public.slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;