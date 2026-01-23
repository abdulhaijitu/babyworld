-- Allow staff to create tickets
CREATE POLICY "Staff can create tickets" 
ON public.tickets 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin', 'manager', 'staff']::app_role[])
);

-- Allow staff to update tickets (mark as used, etc.)
CREATE POLICY "Staff can update tickets" 
ON public.tickets 
FOR UPDATE 
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['admin', 'manager', 'staff']::app_role[])
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin', 'manager', 'staff']::app_role[])
);