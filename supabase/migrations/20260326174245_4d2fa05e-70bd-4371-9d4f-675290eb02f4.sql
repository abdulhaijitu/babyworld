ALTER TABLE public.rides ADD COLUMN duration_minutes integer DEFAULT 0;
ALTER TABLE public.rides ADD COLUMN max_riders integer DEFAULT null;
ALTER TABLE public.rides ADD COLUMN ride_type text DEFAULT 'Paid';