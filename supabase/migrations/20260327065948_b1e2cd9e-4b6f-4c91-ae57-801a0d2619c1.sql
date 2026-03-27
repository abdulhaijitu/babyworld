CREATE POLICY "Staff can create payments"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]));

CREATE POLICY "Staff can update payments"
ON public.payments FOR UPDATE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]));

CREATE POLICY "Admins can delete payments"
ON public.payments FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));