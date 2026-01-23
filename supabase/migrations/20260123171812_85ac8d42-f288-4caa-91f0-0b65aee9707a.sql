-- Create notification_logs table for tracking all sent notifications
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_id UUID,
  reference_type TEXT NOT NULL, -- 'ticket', 'food_order', 'booking'
  channel TEXT NOT NULL, -- 'sms', 'whatsapp'
  recipient_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
  provider_response JSONB,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Admins and managers can view notification logs
CREATE POLICY "Admins and managers can view notification logs"
ON public.notification_logs
FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

-- System can insert notification logs (via edge functions)
CREATE POLICY "Service role can manage notification logs"
ON public.notification_logs
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_notification_logs_reference ON public.notification_logs(reference_id, reference_type);
CREATE INDEX idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX idx_notification_logs_created ON public.notification_logs(created_at DESC);

-- Add notification settings to settings table if not exists
INSERT INTO public.settings (key, category, value)
VALUES 
  ('notification_channels', 'notifications', '{"sms": true, "whatsapp": true}'::jsonb),
  ('admin_notifications', 'notifications', '{"enabled": false, "phone": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;