CREATE POLICY "Staff can create bookings"
ON public.bookings FOR INSERT TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]));

CREATE POLICY "Staff can update bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]));

CREATE POLICY "Admins can delete bookings"
ON public.bookings FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));