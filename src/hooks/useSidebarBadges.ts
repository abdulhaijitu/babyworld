import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

type SidebarBadges = Record<string, number>;

async function fetchBadgeCounts(): Promise<SidebarBadges> {
  const today = new Date().toISOString().split('T')[0];

  const [foodRes, ticketRes, leadsRes, notifRes] = await Promise.all([
    // Pending food orders today
    supabase
      .from('food_orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .gte('created_at', `${today}T00:00:00`),
    // Today's active tickets
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('slot_date', today)
      .eq('status', 'active'),
    // New/uncontacted leads
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new'),
    // Unread notifications for current user
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false),
  ]);

  return {
    'food-orders': foodRes.count ?? 0,
    'create-ticket': ticketRes.count ?? 0,
    'leads': leadsRes.count ?? 0,
    'notifications': notifRes.count ?? 0,
  };
}

export function useSidebarBadges() {
  const [realtimeTrigger, setRealtimeTrigger] = useState(0);

  const { data: badges = { 'food-orders': 0, 'create-ticket': 0, 'leads': 0, 'notifications': 0 } } = useQuery({
    queryKey: ['sidebar-badges', realtimeTrigger],
    queryFn: fetchBadgeCounts,
    refetchInterval: 60000, // fallback refresh every 60s
    staleTime: 30000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('sidebar-badges-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_orders' }, () => setRealtimeTrigger(t => t + 1))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => setRealtimeTrigger(t => t + 1))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => setRealtimeTrigger(t => t + 1))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => setRealtimeTrigger(t => t + 1))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return badges;
}
