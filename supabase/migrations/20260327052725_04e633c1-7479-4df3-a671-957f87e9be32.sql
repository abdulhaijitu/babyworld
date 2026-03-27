-- Update food_orders: allow staff to SELECT, INSERT, UPDATE
DROP POLICY IF EXISTS "Admins can manage food orders" ON public.food_orders;

CREATE POLICY "Staff can view food orders"
  ON public.food_orders FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role]));

CREATE POLICY "Staff can insert food orders"
  ON public.food_orders FOR INSERT
  TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role]));

CREATE POLICY "Staff can update food orders"
  ON public.food_orders FOR UPDATE
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role]));

CREATE POLICY "Admins can delete food orders"
  ON public.food_orders FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update food_order_items: allow staff to SELECT and INSERT
DROP POLICY IF EXISTS "Admins can manage food order items" ON public.food_order_items;

CREATE POLICY "Staff can view food order items"
  ON public.food_order_items FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role]));

CREATE POLICY "Staff can insert food order items"
  ON public.food_order_items FOR INSERT
  TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'staff'::app_role]));

CREATE POLICY "Admins can update food order items"
  ON public.food_order_items FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete food order items"
  ON public.food_order_items FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));