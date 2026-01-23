-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to call notify-booking edge function
CREATE OR REPLACE FUNCTION public.notify_on_booking_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
  edge_function_url text;
BEGIN
  -- Build payload
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', CASE 
      WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb
      ELSE row_to_json(NEW)::jsonb
    END
  );
  
  -- Get the edge function URL from environment
  edge_function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-booking';
  
  -- If URL not set, use default pattern
  IF edge_function_url IS NULL OR edge_function_url = '/functions/v1/notify-booking' THEN
    edge_function_url := 'https://plopgpcbfeipgjycjbzi.supabase.co/functions/v1/notify-booking';
  END IF;

  -- Make async HTTP POST request
  PERFORM extensions.http_post(
    url := edge_function_url,
    body := payload::text,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )::jsonb
  );
  
  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'notify_on_booking_change failed: %', SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for bookings table
DROP TRIGGER IF EXISTS trigger_notify_booking_insert ON public.bookings;
CREATE TRIGGER trigger_notify_booking_insert
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_booking_change();

DROP TRIGGER IF EXISTS trigger_notify_booking_update ON public.bookings;
CREATE TRIGGER trigger_notify_booking_update
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.payment_status IS DISTINCT FROM NEW.payment_status)
  EXECUTE FUNCTION public.notify_on_booking_change();

-- Create triggers for payments table
DROP TRIGGER IF EXISTS trigger_notify_payment_insert ON public.payments;
CREATE TRIGGER trigger_notify_payment_insert
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_booking_change();

DROP TRIGGER IF EXISTS trigger_notify_payment_update ON public.payments;
CREATE TRIGGER trigger_notify_payment_update
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_on_booking_change();

-- Create triggers for tickets table
DROP TRIGGER IF EXISTS trigger_notify_ticket_insert ON public.tickets;
CREATE TRIGGER trigger_notify_ticket_insert
  AFTER INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_booking_change();