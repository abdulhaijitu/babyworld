import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAttendance(date?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['attendance', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, employees(name, phone, role)')
        .eq('attendance_date', targetDate)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsertAttendance = useMutation({
    mutationFn: async (record: {
      employee_id: string;
      attendance_date: string;
      check_in?: string;
      check_out?: string;
      status: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('attendance')
        .upsert(record as any, { onConflict: 'employee_id,attendance_date' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({ title: 'Attendance saved' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  return { records, isLoading, upsertAttendance };
}
