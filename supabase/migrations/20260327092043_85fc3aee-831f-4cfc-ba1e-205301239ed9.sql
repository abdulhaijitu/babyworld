
-- Create enums for SMS campaigns
CREATE TYPE public.campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');
CREATE TYPE public.campaign_audience AS ENUM ('all_customers', 'members', 'expired_members', 'leads', 'event_bookings', 'custom');

-- Create sms_campaigns table
CREATE TABLE public.sms_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  audience campaign_audience NOT NULL DEFAULT 'all_customers',
  status campaign_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  custom_phones TEXT[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins and managers can manage sms campaigns"
  ON public.sms_campaigns FOR ALL
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

-- Updated_at trigger
CREATE TRIGGER update_sms_campaigns_updated_at
  BEFORE UPDATE ON public.sms_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
