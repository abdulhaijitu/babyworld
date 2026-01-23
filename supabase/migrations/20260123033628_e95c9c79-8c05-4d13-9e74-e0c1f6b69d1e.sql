-- =============================================
-- TICKETING SYSTEM TABLES
-- =============================================

-- Ticket source enum
CREATE TYPE public.ticket_source AS ENUM ('online', 'physical');

-- Ticket status enum
CREATE TYPE public.ticket_status AS ENUM ('active', 'used', 'cancelled');

-- Tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  ticket_type TEXT NOT NULL DEFAULT 'hourly_play',
  source ticket_source NOT NULL DEFAULT 'physical',
  status ticket_status NOT NULL DEFAULT 'active',
  slot_date DATE NOT NULL,
  time_slot TEXT,
  child_name TEXT,
  guardian_name TEXT NOT NULL,
  guardian_phone TEXT NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  notes TEXT,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tickets
CREATE POLICY "Admins can manage tickets"
  ON public.tickets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view tickets"
  ON public.tickets FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FOOD SELLING SYSTEM TABLES
-- =============================================

-- Food category enum
CREATE TYPE public.food_category AS ENUM ('snacks', 'drinks', 'meals');

-- Food items table
CREATE TABLE public.food_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  category food_category NOT NULL DEFAULT 'snacks',
  price NUMERIC NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for food_items
CREATE POLICY "Anyone can view food items"
  ON public.food_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage food items"
  ON public.food_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_food_items_updated_at
  BEFORE UPDATE ON public.food_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Food order status enum
CREATE TYPE public.food_order_status AS ENUM ('pending', 'served', 'cancelled');

-- Food payment type enum
CREATE TYPE public.food_payment_type AS ENUM ('cash', 'online', 'pending');

-- Food orders table
CREATE TABLE public.food_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  customer_name TEXT,
  status food_order_status NOT NULL DEFAULT 'pending',
  payment_type food_payment_type NOT NULL DEFAULT 'cash',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for food_orders
CREATE POLICY "Admins can manage food orders"
  ON public.food_orders FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_food_orders_updated_at
  BEFORE UPDATE ON public.food_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Food order items table
CREATE TABLE public.food_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.food_orders(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for food_order_items
CREATE POLICY "Admins can manage food order items"
  ON public.food_order_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- EMPLOYEE MANAGEMENT TABLES
-- =============================================

-- Employee role enum
CREATE TYPE public.employee_role AS ENUM ('staff', 'supervisor', 'manager');

-- Employee status enum
CREATE TYPE public.employee_status AS ENUM ('active', 'inactive');

-- Employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role employee_role NOT NULL DEFAULT 'staff',
  phone TEXT NOT NULL,
  email TEXT,
  status employee_status NOT NULL DEFAULT 'active',
  hire_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "Admins can manage employees"
  ON public.employees FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Roster shifts table
CREATE TABLE public.roster_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT no_overlapping_shifts UNIQUE (employee_id, shift_date, start_time)
);

-- Enable RLS
ALTER TABLE public.roster_shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roster_shifts
CREATE POLICY "Admins can manage roster shifts"
  ON public.roster_shifts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_roster_shifts_updated_at
  BEFORE UPDATE ON public.roster_shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();