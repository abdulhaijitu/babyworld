CREATE POLICY "Staff can create slots"
ON public.slots FOR INSERT TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]));

CREATE POLICY "Staff can update slots"
ON public.slots FOR UPDATE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]));

CREATE POLICY "Admins can delete slots"
ON public.slots FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));