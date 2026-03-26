import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

export function ExpiringCardsAlert() {
  const navigate = useNavigate();

  const { data: expiringCards = [] } = useQuery({
    queryKey: ["expiring-hero-cards"],
    queryFn: async () => {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const { data, error } = await supabase
        .from("hero_cards")
        .select("id, title, badge, expires_at")
        .eq("is_active", true)
        .not("expires_at", "is", null)
        .lte("expires_at", threeDaysFromNow.toISOString())
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (expiringCards.length === 0) return null;

  return (
    <Alert
      variant="destructive"
      className="cursor-pointer border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400"
      onClick={() => navigate("/admin/homepage")}
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        Expiring Offers
        <Badge variant="outline" className="border-yellow-500/50 text-yellow-700 dark:text-yellow-400">
          {expiringCards.length}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-1 space-y-1">
        {expiringCards.map((card) => (
          <div key={card.id} className="flex items-center gap-2 text-sm">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="font-medium">{card.title || card.badge}</span>
            <span className="text-muted-foreground">
              — expires {formatDistanceToNow(parseISO(card.expires_at!), { addSuffix: true })}
            </span>
          </div>
        ))}
        <p className="text-xs text-muted-foreground mt-1">Click to manage →</p>
      </AlertDescription>
    </Alert>
  );
}
