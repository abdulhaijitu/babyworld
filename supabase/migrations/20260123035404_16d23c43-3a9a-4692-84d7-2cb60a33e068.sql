-- Create settings table for storing app configuration
CREATE TABLE public.settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    category text NOT NULL DEFAULT 'general',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies - Only admins can manage settings
CREATE POLICY "Admins can manage settings" 
ON public.settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow anyone to read settings (for public settings like business hours)
CREATE POLICY "Anyone can view settings" 
ON public.settings 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value, category) VALUES
    ('pricing_hourly', '{"child_guardian": 250, "child_only": 200, "group": 1800}', 'pricing'),
    ('pricing_events', '{"basic": 5000, "standard": 8000, "premium": 12000, "deluxe": 18000}', 'pricing'),
    ('time_slots', '[{"id": "10:00-12:00", "start": "10:00", "end": "12:00", "enabled": true}, {"id": "12:00-14:00", "start": "12:00", "end": "14:00", "enabled": true}, {"id": "14:00-16:00", "start": "14:00", "end": "16:00", "enabled": true}, {"id": "16:00-18:00", "start": "16:00", "end": "18:00", "enabled": true}, {"id": "18:00-20:00", "start": "18:00", "end": "20:00", "enabled": true}]', 'schedule'),
    ('business_info', '{"name": "Baby World Indoor Playground", "phone": "+880 1234-567890", "email": "info@babyworld.com", "address": "Dhaka, Bangladesh", "openTime": "10:00", "closeTime": "20:00"}', 'business'),
    ('notifications', '{"emailEnabled": true, "smsEnabled": true}', 'general'),
    ('theme', '{"darkMode": false}', 'general');