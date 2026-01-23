-- Create trigger function for expense audit logging
CREATE OR REPLACE FUNCTION public.log_expense_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_type text;
  details_json jsonb;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'expense_created';
    details_json := jsonb_build_object(
      'expense_id', NEW.id,
      'category', NEW.category,
      'amount', NEW.amount,
      'description', NEW.description,
      'expense_date', NEW.expense_date,
      'payment_method', NEW.payment_method,
      'added_by_name', NEW.added_by_name
    );
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'expense_updated';
    details_json := jsonb_build_object(
      'expense_id', NEW.id,
      'changes', jsonb_build_object(
        'old_amount', OLD.amount,
        'new_amount', NEW.amount,
        'old_category', OLD.category,
        'new_category', NEW.category,
        'old_description', OLD.description,
        'new_description', NEW.description
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'expense_deleted';
    details_json := jsonb_build_object(
      'expense_id', OLD.id,
      'category', OLD.category,
      'amount', OLD.amount,
      'description', OLD.description
    );
  END IF;

  -- Insert into activity_logs
  INSERT INTO public.activity_logs (
    entity_type,
    entity_id,
    action,
    user_id,
    details
  ) VALUES (
    'expense',
    COALESCE(NEW.id, OLD.id),
    action_type,
    auth.uid(),
    details_json
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for expense changes
DROP TRIGGER IF EXISTS expense_audit_trigger ON public.expenses;
CREATE TRIGGER expense_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.log_expense_changes();