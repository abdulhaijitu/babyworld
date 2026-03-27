import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePerformance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_performance')
        .select('*, employees(name, phone, role)')
        .order('reviewed_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createReview = useMutation({
    mutationFn: async (review: {
      employee_id: string;
      review_period: string;
      rating: number;
      reviewer_notes?: string;
    }) => {
      const { error } = await supabase.from('employee_performance').insert(review as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] });
      toast({ title: 'Performance review saved' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  return { reviews, isLoading, createReview };
}
