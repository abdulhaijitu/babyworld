import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useEmployeeLeaves() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ['employee-leaves'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_leaves')
        .select('*, employees(name, phone)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createLeave = useMutation({
    mutationFn: async (leave: {
      employee_id: string;
      leave_type: string;
      start_date: string;
      end_date: string;
      reason?: string;
    }) => {
      const { error } = await supabase.from('employee_leaves').insert(leave as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-leaves'] });
      toast({ title: 'Leave request created' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateLeaveStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('employee_leaves')
        .update({ status } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-leaves'] });
      toast({ title: 'Leave status updated' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  return { leaves, isLoading, createLeave, updateLeaveStatus };
}
