import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeroSlide {
  id: string;
  image_url: string;
  label: string;
  alt_text: string;
  sort_order: number;
  is_active: boolean;
}

export function useHeroSlides() {
  return useQuery({
    queryKey: ["hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as HeroSlide[];
    },
    staleTime: 1000 * 60 * 5,
  });
}
