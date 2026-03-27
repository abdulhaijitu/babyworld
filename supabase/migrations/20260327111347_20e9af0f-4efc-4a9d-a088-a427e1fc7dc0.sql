
-- Create expense_categories table
CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  icon TEXT DEFAULT 'receipt',
  color TEXT DEFAULT 'bg-gray-100 text-gray-800',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins and managers can manage expense categories"
  ON public.expense_categories
  FOR ALL
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Staff can view expense categories"
  ON public.expense_categories
  FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role]));

-- Seed existing 8 categories
INSERT INTO public.expense_categories (name, label, icon, color) VALUES
  ('rent', 'Rent', 'building', 'bg-blue-100 text-blue-800'),
  ('staff_salary', 'Staff Salary', 'users', 'bg-purple-100 text-purple-800'),
  ('utilities', 'Utilities', 'zap', 'bg-yellow-100 text-yellow-800'),
  ('food_purchase', 'Food Purchase', 'shopping-cart', 'bg-orange-100 text-orange-800'),
  ('toys_equipment', 'Toys & Equipment', 'gamepad-2', 'bg-pink-100 text-pink-800'),
  ('maintenance', 'Maintenance', 'wrench', 'bg-gray-100 text-gray-800'),
  ('marketing', 'Marketing', 'megaphone', 'bg-green-100 text-green-800'),
  ('other', 'Other', 'more-horizontal', 'bg-slate-100 text-slate-800');
