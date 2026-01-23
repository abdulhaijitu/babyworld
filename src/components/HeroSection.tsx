import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import playgroundKids from "@/assets/playground-kids.jpg";
import mascotKids from "@/assets/mascot-kids.jpg";
import carouselRides from "@/assets/carousel-rides.jpg";
import arcadeGames from "@/assets/arcade-games.jpg";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      className="relative min-h-[85svh] flex items-center py-12 sm:py-16 overflow-hidden"
    >
      {/* Beautiful gradient background inspired by logo */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-info/10 via-transparent to-transparent" />
      </div>
      
      {/* Animated decorative blobs */}
      <motion.div 
        className="absolute top-20 right-[10%] w-80 h-80 bg-gradient-to-br from-primary/15 to-secondary/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1], 
          opacity: [0.4, 0.6, 0.4],
          x: [0, 20, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-10 left-[5%] w-96 h-96 bg-gradient-to-tr from-secondary/10 to-accent/15 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.15, 1], 
          opacity: [0.3, 0.5, 0.3],
          y: [0, -30, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div 
        className="absolute top-1/2 right-[30%] w-64 h-64 bg-gradient-to-bl from-info/10 to-primary/5 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.1, 1], 
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="container relative mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-card border border-primary/10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.span 
                className="text-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                ⭐
              </motion.span>
              <span className="text-sm font-medium text-foreground">
                {t("hero.badge")}
              </span>
            </motion.div>

            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {t("hero.title1")}{" "}
              <span className="text-primary">{t("hero.learn")}</span> {t("hero.and")}{" "}
              <span className="text-secondary">{t("hero.play")}</span>
            </motion.h1>

            <motion.p 
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {t("hero.description")}
            </motion.p>

            {/* Trust badges */}
            <motion.div 
              className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-success" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {t("hero.safeEnvironment")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-info" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {t("hero.hourlyPlay")}
                </span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Button size="lg" className="shadow-button w-full sm:w-auto touch-target" asChild>
                <Link to="/play-booking">{t("hero.viewOptions")}</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground w-full sm:w-auto touch-target" asChild>
                <Link to="/birthday-events">{t("hero.birthdayEvents")}</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Image Gallery with Animations */}
          <motion.div 
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main large image - Kids at playground */}
              <motion.div 
                className="absolute top-8 left-8 w-[70%] aspect-[4/5] rounded-3xl overflow-hidden shadow-card-hover border-4 border-card z-10"
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <img 
                  src={playgroundKids} 
                  alt="Children playing at Baby World" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </motion.div>

              {/* Top right image - Kids with mascot */}
              <motion.div 
                className="absolute -top-4 right-0 w-[45%] aspect-square rounded-2xl overflow-hidden shadow-card border-4 border-card z-20"
                animate={{ y: [6, -6, 6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <img 
                  src={mascotKids} 
                  alt="Kids with Mario mascot" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
              </motion.div>

              {/* Bottom right image - Carousel */}
              <motion.div 
                className="absolute bottom-4 right-4 w-[40%] aspect-[3/4] rounded-2xl overflow-hidden shadow-card border-4 border-card z-20"
                animate={{ y: [-5, 10, -5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <img 
                  src={carouselRides} 
                  alt="Carousel and rides" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tl from-info/10 to-transparent" />
              </motion.div>

              {/* Floating child-themed elements */}
              <motion.div 
                className="absolute -top-6 left-[20%] w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg z-30"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 10, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-3xl">🎈</span>
              </motion.div>

              <motion.div 
                className="absolute bottom-[30%] -left-4 w-14 h-14 bg-secondary/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg z-30"
                animate={{ 
                  y: [0, 12, 0],
                  rotate: [0, -8, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <span className="text-2xl">🎮</span>
              </motion.div>

              <motion.div 
                className="absolute top-[40%] -right-2 w-12 h-12 bg-success/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg z-30"
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <span className="text-xl">🎠</span>
              </motion.div>

              <motion.div 
                className="absolute -bottom-2 left-[30%] w-14 h-14 bg-info/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg z-30"
                animate={{ 
                  y: [0, -8, 0],
                  x: [0, 5, 0]
                }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              >
                <span className="text-2xl">🎪</span>
              </motion.div>

              {/* Small decorative image - Arcade */}
              <motion.div 
                className="absolute bottom-0 left-0 w-20 h-20 rounded-xl overflow-hidden shadow-card border-2 border-card z-20"
                animate={{ 
                  rotate: [-5, 5, -5],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <img 
                  src={arcadeGames} 
                  alt="Arcade games" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
