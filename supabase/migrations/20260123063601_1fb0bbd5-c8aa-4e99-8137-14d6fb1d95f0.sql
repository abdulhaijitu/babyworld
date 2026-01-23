-- Create expense category enum
CREATE TYPE public.expense_category AS ENUM (
  'rent',
  'staff_salary',
  'utilities',
  'food_purchase',
  'toys_equipment',
  'maintenance',
  'marketing',
  'other'
);

-- Create payment method enum for expenses
CREATE TYPE public.expense_payment_method AS ENUM (
  'cash',
  'bank',
  'online'
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category expense_category NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_method expense_payment_method NOT NULL DEFAULT 'cash',
  added_by UUID REFERENCES auth.users(id),
  added_by_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expenses
-- Admins and Managers can view expenses
CREATE POLICY "Admins and managers can view expenses"
ON public.expenses
FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

-- Admins and Managers can insert expenses
CREATE POLICY "Admins and managers can add expenses"
ON public.expenses
FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

-- Only Admins can update expenses
CREATE POLICY "Only admins can update expenses"
ON public.expenses
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only Admins can delete expenses
CREATE POLICY "Only admins can delete expenses"
ON public.expenses
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX idx_expenses_category ON public.expenses(category);

-- Add trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();