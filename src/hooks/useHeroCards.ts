import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeroCard {
  id: string;
  type: "offer" | "event";
  badge: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  date_text: string | null;
  is_active: boolean;
  sort_order: number;
}

export function useHeroCards() {
  return useQuery({
    queryKey: ["hero-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_cards")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as HeroCard[];
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}
