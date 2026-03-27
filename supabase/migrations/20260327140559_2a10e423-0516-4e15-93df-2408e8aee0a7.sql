
-- Create income_categories table
CREATE TABLE public.income_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  icon TEXT DEFAULT 'banknote',
  color TEXT DEFAULT 'bg-green-100 text-green-800',
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create incomes table
CREATE TABLE public.incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  income_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  description TEXT NOT NULL,
  notes TEXT,
  added_by UUID,
  added_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

-- RLS for income_categories
CREATE POLICY "Admins and managers can manage income categories"
  ON public.income_categories FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Staff can view income categories"
  ON public.income_categories FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role]));

-- RLS for incomes
CREATE POLICY "Admins and managers can manage incomes"
  ON public.incomes FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Staff can view incomes"
  ON public.incomes FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role]));

-- Seed income categories
INSERT INTO public.income_categories (name, label, icon, color, is_system) VALUES
  ('ticketing', 'Ticketing', 'ticket', 'bg-blue-100 text-blue-800', true),
  ('food_sales', 'Food Sales', 'utensils-crossed', 'bg-orange-100 text-orange-800', true),
  ('membership', 'Membership', 'crown', 'bg-purple-100 text-purple-800', true),
  ('investment', 'Investment', 'trending-up', 'bg-green-100 text-green-800', false),
  ('loan', 'Loan', 'banknote', 'bg-yellow-100 text-yellow-800', false),
  ('donation', 'Donation', 'heart', 'bg-pink-100 text-pink-800', false),
  ('sponsorship', 'Sponsorship', 'award', 'bg-teal-100 text-teal-800', false),
  ('other', 'Other', 'circle-dot', 'bg-gray-100 text-gray-800', false);
