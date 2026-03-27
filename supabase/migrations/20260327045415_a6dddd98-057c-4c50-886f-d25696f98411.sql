
CREATE TABLE public.membership_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
  check_in_at timestamptz NOT NULL DEFAULT now(),
  check_out_at timestamptz,
  checked_in_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.membership_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage visits" ON public.membership_visits
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','manager','staff']::app_role[]));
