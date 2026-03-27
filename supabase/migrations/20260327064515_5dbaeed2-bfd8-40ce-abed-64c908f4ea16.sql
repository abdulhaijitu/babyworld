
CREATE TABLE public.event_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  max_guests INTEGER NOT NULL DEFAULT 10,
  duration_hours INTEGER NOT NULL DEFAULT 3,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage event packages"
  ON public.event_packages FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Anyone can view active event packages"
  ON public.event_packages FOR SELECT
  TO public
  USING (is_active = true);

CREATE TRIGGER update_event_packages_updated_at
  BEFORE UPDATE ON public.event_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default packages
INSERT INTO public.event_packages (name, price, max_guests, duration_hours, features, sort_order) VALUES
  ('Basic', 5000, 10, 3, '["Play area access", "Basic decoration"]', 1),
  ('Standard', 8000, 20, 3, '["Play area access", "Themed decoration", "Cake arrangement"]', 2),
  ('Premium', 12000, 30, 4, '["Play area access", "Premium decoration", "Cake & snacks", "Photo zone"]', 3),
  ('Deluxe', 18000, 50, 5, '["Full venue access", "Luxury decoration", "Full catering", "Photo & video", "Return gifts"]', 4);
