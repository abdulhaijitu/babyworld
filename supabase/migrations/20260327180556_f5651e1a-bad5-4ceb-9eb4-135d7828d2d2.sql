
-- Add new role values to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'management';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_marketing';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ticket_counterman';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gateman';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'food_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'food_staff';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'booking_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'accountant';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hr_manager';

-- Create role_permissions table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  module text NOT NULL,
  can_view boolean DEFAULT true,
  can_create boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(role, module)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Only super_admin can manage role_permissions
CREATE POLICY "Super admins can manage role permissions"
  ON public.role_permissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Authenticated users can view role_permissions (needed for access checks)
CREATE POLICY "Authenticated users can view role permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Insert default permissions for each role
INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete) VALUES
-- Management: full access except delete
('management', 'ticketing', true, true, true, false),
('management', 'membership', true, true, true, false),
('management', 'foods', true, true, true, false),
('management', 'events', true, true, true, false),
('management', 'marketing', true, true, true, false),
('management', 'hr', true, true, true, false),
('management', 'accounts', true, true, true, false),
('management', 'frontend', true, true, true, false),
('management', 'settings', true, true, true, false),
('management', 'notifications', true, true, true, false),

-- Manager
('manager', 'ticketing', true, true, true, false),
('manager', 'membership', true, true, true, false),
('manager', 'foods', true, true, true, false),
('manager', 'events', true, true, true, false),
('manager', 'marketing', true, true, true, false),
('manager', 'hr', true, true, true, false),
('manager', 'accounts', true, true, true, false),
('manager', 'notifications', true, false, false, false),

-- Sales & Marketing
('sales_marketing', 'marketing', true, true, true, false),
('sales_marketing', 'events', true, true, true, false),
('sales_marketing', 'notifications', true, false, false, false),

-- Ticket Counterman
('ticket_counterman', 'ticketing', true, true, true, false),
('ticket_counterman', 'membership', true, true, false, false),

-- Gateman
('gateman', 'ticketing', true, false, true, false),

-- Food Manager
('food_manager', 'foods', true, true, true, false),

-- Food Staff
('food_staff', 'foods', true, true, false, false),

-- Booking Manager
('booking_manager', 'events', true, true, true, false),
('booking_manager', 'marketing', true, false, false, false),

-- Accountant
('accountant', 'accounts', true, true, true, false),
('accountant', 'notifications', true, false, false, false),

-- HR Manager
('hr_manager', 'hr', true, true, true, false),
('hr_manager', 'accounts', true, false, false, false);
