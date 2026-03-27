import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'lost';
export type LeadSource = 'facebook' | 'instagram' | 'walk_in' | 'referral' | 'website' | 'phone' | 'other';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  follow_up_date: string | null;
  interested_in: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
export type LeadUpdate = Partial<LeadInsert>;

export function useLeads(statusFilter?: LeadStatus | 'all') {
  return useQuery({
    queryKey: ['leads', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Lead[];
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lead: LeadInsert) => {
      const { data, error } = await supabase
        .from('leads')
        .insert(lead as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('লিড সফলভাবে যোগ হয়েছে');
    },
    onError: (error: any) => {
      toast.error('লিড যোগ করতে ব্যর্থ: ' + error.message);
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: LeadUpdate }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('লিড আপডেট হয়েছে');
    },
    onError: (error: any) => {
      toast.error('আপডেট ব্যর্থ: ' + error.message);
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('লিড ডিলিট হয়েছে');
    },
    onError: (error: any) => {
      toast.error('ডিলিট ব্যর্থ: ' + error.message);
    },
  });
}
