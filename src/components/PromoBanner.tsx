import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Gift, Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useLanguage();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <Sparkles className="absolute top-2 left-[10%] w-4 h-4 text-white/30 animate-pulse" />
          <Sparkles className="absolute bottom-2 right-[15%] w-3 h-3 text-white/20 animate-pulse" />
        </div>

        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center justify-between gap-4">
            {/* Main content */}
            <div className="flex items-center gap-3 flex-wrap justify-center flex-1">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-white/90 flex-shrink-0" />
                <span className="font-bold text-sm md:text-base">
                  {t("promo.badge")}
                </span>
              </div>
              
              <span className="hidden sm:inline text-white/60">|</span>
              
              <p className="text-sm md:text-base text-white/90">
                {t("promo.message")}
              </p>

              <div className="flex items-center gap-2 text-xs md:text-sm bg-white/20 px-3 py-1 rounded-full">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t("promo.validUntil")}</span>
              </div>
            </div>

            {/* CTA and Close */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 font-semibold text-xs md:text-sm"
                asChild
              >
                <Link to="/play-booking">{t("promo.cta")}</Link>
              </Button>
              
              <button
                onClick={() => setIsVisible(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
