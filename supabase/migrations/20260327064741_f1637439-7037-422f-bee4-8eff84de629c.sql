
ALTER TABLE public.event_packages ADD COLUMN image_url TEXT;

INSERT INTO storage.buckets (id, name, public) VALUES ('event-package-images', 'event-package-images', true);

CREATE POLICY "Anyone can view event package images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'event-package-images');

CREATE POLICY "Admins can upload event package images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-package-images' AND public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Admins can update event package images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-package-images' AND public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Admins can delete event package images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-package-images' AND public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));
