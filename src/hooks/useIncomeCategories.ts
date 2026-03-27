import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface IncomeCategory {
  id: string;
  name: string;
  label: string;
  icon: string;
  color: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

export function useIncomeCategories(activeOnly = false) {
  return useQuery({
    queryKey: ['income-categories', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('income_categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IncomeCategory[];
    },
  });
}
