import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PartyPopper, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EventsHeroProps {
  onExplorePackages: () => void;
  onRequestBooking: () => void;
}

export function EventsHero({ onExplorePackages, onRequestBooking }: EventsHeroProps) {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[80svh] flex items-center pt-20 pb-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-background to-accent" />
      
      {/* Decorative circles */}
      <motion.div 
        className="absolute top-20 right-10 w-72 h-72 bg-secondary/15 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <PartyPopper className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-foreground">
              {t("eventsPage.hero.badge")}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {t("eventsPage.hero.title")}{" "}
            <span className="text-secondary">{t("eventsPage.hero.titleHighlight")}</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {t("eventsPage.hero.description")}
          </motion.p>

          {/* Trust badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <Star className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {t("eventsPage.packages.ageRange")}
              </span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button size="lg" variant="secondary" onClick={onExplorePackages} className="w-full sm:w-auto touch-target">
              {t("eventsPage.hero.cta1")}
            </Button>
            <Button size="lg" variant="outline" onClick={onRequestBooking} className="w-full sm:w-auto touch-target">
              {t("eventsPage.hero.cta2")}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
