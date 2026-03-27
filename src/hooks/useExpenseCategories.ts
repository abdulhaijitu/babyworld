import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExpenseCategory {
  id: string;
  name: string;
  label: string;
  icon: string;
  color: string;
  is_active: boolean;
}

export function useExpenseCategories(activeOnly = false) {
  return useQuery({
    queryKey: ['expense-categories', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('expense_categories')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ExpenseCategory[];
    },
  });
}
