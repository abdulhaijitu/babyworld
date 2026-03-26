
CREATE TABLE public.membership_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_type public.membership_type NOT NULL UNIQUE,
  name text NOT NULL,
  name_bn text,
  duration_days integer NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  discount_percent integer NOT NULL DEFAULT 100,
  max_children integer NOT NULL DEFAULT 1,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.membership_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages" ON public.membership_packages
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage packages" ON public.membership_packages
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

INSERT INTO public.membership_packages (membership_type, name, duration_days, price, discount_percent, max_children, sort_order) VALUES
  ('monthly', 'Monthly Package', 30, 1500, 100, 1, 1),
  ('quarterly', 'Quarterly Package', 90, 4000, 100, 1, 2),
  ('yearly', 'Yearly Package', 365, 12000, 100, 1, 3);
