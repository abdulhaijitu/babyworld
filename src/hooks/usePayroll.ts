import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePayroll(month?: number, year?: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ['payroll', targetMonth, targetYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_payroll')
        .select('*, employees(name, phone, role)')
        .eq('month', targetMonth)
        .eq('year', targetYear)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsertPayroll = useMutation({
    mutationFn: async (record: {
      employee_id: string;
      month: number;
      year: number;
      basic_salary: number;
      deductions: number;
      bonuses: number;
      net_salary: number;
      status?: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('employee_payroll')
        .upsert(record as any, { onConflict: 'employee_id,month,year' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast({ title: 'Payroll saved' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const markAsPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_payroll')
        .update({ status: 'paid', paid_at: new Date().toISOString() } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast({ title: 'Marked as paid' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  return { payrolls, isLoading, upsertPayroll, markAsPaid };
}
