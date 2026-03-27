import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PromoDiscountType = 'percentage' | 'fixed';
export type PromoApplicableTo = 'ticket' | 'food' | 'event' | 'membership' | 'all';
export type PromoStatus = 'draft' | 'active' | 'paused' | 'expired';

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  promo_code: string | null;
  discount_type: PromoDiscountType;
  discount_value: number;
  applicable_to: PromoApplicableTo;
  status: PromoStatus;
  start_date: string;
  end_date: string | null;
  max_uses: number | null;
  usage_count: number;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type PromotionInsert = Omit<Promotion, 'id' | 'created_at' | 'updated_at' | 'usage_count'>;
export type PromotionUpdate = Partial<PromotionInsert>;

export function usePromotions(statusFilter?: PromoStatus | 'all') {
  return useQuery({
    queryKey: ['promotions', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Promotion[];
    },
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promo: PromotionInsert) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert(promo as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create promotion: ' + error.message);
    },
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PromotionUpdate }) => {
      const { data, error } = await supabase
        .from('promotions')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion updated');
    },
    onError: (error: any) => {
      toast.error('Update failed: ' + error.message);
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion deleted');
    },
    onError: (error: any) => {
      toast.error('Delete failed: ' + error.message);
    },
  });
}
