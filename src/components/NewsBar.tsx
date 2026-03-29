import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

interface NewsItem {
  id: string;
  text: string;
  link?: string | null;
  active: boolean;
}

interface NewsTickerData {
  enabled: boolean;
  speed: string;
  items: NewsItem[];
}

export function NewsBar() {
  const [data, setData] = useState<NewsTickerData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      const { data: setting } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "news_ticker")
        .maybeSingle();

      if (setting?.value) {
        setData(setting.value as unknown as NewsTickerData);
      }
    };
    fetchNews();
  }, []);

  if (!data || !data.enabled || dismissed) return null;

  const activeItems = data.items.filter((item) => item.active);
  if (activeItems.length === 0) return null;

  const speedClass =
    data.speed === "slow"
      ? "animate-[ticker_40s_linear_infinite]"
      : data.speed === "fast"
        ? "animate-[ticker_15s_linear_infinite]"
        : "animate-[ticker_25s_linear_infinite]";

  return (
    <div className="sticky top-[56px] sm:top-[64px] z-40 bg-primary text-primary-foreground overflow-hidden">
      <div className="relative flex items-center h-8 sm:h-9">
        {/* Ticker content */}
        <div className="flex-1 overflow-hidden">
          <div className={`flex whitespace-nowrap ${speedClass}`}>
            {/* Duplicate items for seamless loop */}
            {[...activeItems, ...activeItems].map((item, idx) => (
              <span key={idx} className="inline-flex items-center mx-6 sm:mx-8 text-xs sm:text-sm font-medium">
                {item.link ? (
                  <Link
                    to={item.link}
                    className="hover:underline underline-offset-2"
                  >
                    {item.text}
                  </Link>
                ) : (
                  item.text
                )}
                <span className="mx-4 sm:mx-6 opacity-40">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-primary-foreground/10 transition-colors"
          aria-label="Close news bar"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
