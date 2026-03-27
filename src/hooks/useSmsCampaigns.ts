import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
export type CampaignAudience = 'all_customers' | 'members' | 'expired_members' | 'leads' | 'event_bookings' | 'custom';

export interface SmsCampaign {
  id: string;
  name: string;
  message: string;
  audience: CampaignAudience;
  status: CampaignStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  custom_phones: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type SmsCampaignInsert = Omit<SmsCampaign, 'id' | 'created_at' | 'updated_at' | 'sent_at' | 'sent_count' | 'failed_count'>;

export function useSmsCampaigns(statusFilter?: CampaignStatus | 'all') {
  return useQuery({
    queryKey: ['sms-campaigns', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('sms_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SmsCampaign[];
    },
  });
}

export function useCreateSmsCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaign: SmsCampaignInsert) => {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .insert(campaign as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
      toast.success('Campaign created');
    },
    onError: (error: any) => {
      toast.error('Failed to create campaign: ' + error.message);
    },
  });
}

export function useUpdateSmsCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SmsCampaignInsert> }) => {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
      toast.success('Campaign updated');
    },
    onError: (error: any) => {
      toast.error('Update failed: ' + error.message);
    },
  });
}

export function useDeleteSmsCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sms_campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
      toast.success('Campaign deleted');
    },
    onError: (error: any) => {
      toast.error('Delete failed: ' + error.message);
    },
  });
}

// Fetch audience phone numbers based on audience type
export async function fetchAudiencePhones(audience: CampaignAudience): Promise<string[]> {
  let phones: string[] = [];

  switch (audience) {
    case 'members': {
      const { data } = await supabase.from('memberships').select('phone').eq('status', 'active');
      phones = data?.map(m => m.phone) || [];
      break;
    }
    case 'expired_members': {
      const { data } = await supabase.from('memberships').select('phone').eq('status', 'expired');
      phones = data?.map(m => m.phone) || [];
      break;
    }
    case 'leads': {
      const { data } = await supabase.from('leads').select('phone').in('status', ['new', 'contacted', 'interested']);
      phones = (data as any)?.map((l: any) => l.phone) || [];
      break;
    }
    case 'event_bookings': {
      const { data } = await supabase.from('bookings').select('parent_phone').eq('booking_type', 'birthday_event');
      phones = data?.map(b => b.parent_phone) || [];
      break;
    }
    case 'all_customers': {
      const [tickets, memberships, bookings] = await Promise.all([
        supabase.from('tickets').select('guardian_phone'),
        supabase.from('memberships').select('phone'),
        supabase.from('bookings').select('parent_phone'),
      ]);
      const allPhones = [
        ...(tickets.data?.map(t => t.guardian_phone) || []),
        ...(memberships.data?.map(m => m.phone) || []),
        ...(bookings.data?.map(b => b.parent_phone) || []),
      ];
      phones = [...new Set(allPhones)];
      break;
    }
    default:
      break;
  }

  return [...new Set(phones.filter(Boolean))];
}
