import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroCards } from "@/hooks/useHeroCards";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import playgroundKids from "@/assets/playground-kids.jpg";
import mascotKids from "@/assets/mascot-kids.jpg";
import carouselRides from "@/assets/carousel-rides.jpg";
import arcadeGames from "@/assets/arcade-games.jpg";

const slides = [
  { src: playgroundKids, alt: "Children playing at Baby World", label: "Adventure Zone" },
  { src: mascotKids, alt: "Kids with Mario mascot", label: "Fun Characters" },
  { src: carouselRides, alt: "Carousel and rides", label: "Exciting Rides" },
  { src: arcadeGames, alt: "Arcade games", label: "Arcade Games" },
];

// Fallback data when DB is loading or empty
const fallbackOffer = {
  badge: "Special Offer!",
  title: "Visit Baby World Today",
  description: "A safe, hygienic, and joyful indoor playground for children aged 1–10 years.",
  cta_text: "Book Now",
  cta_link: "/play-booking",
};

const fallbackEvent = {
  badge: "Coming Soon",
  title: "Birthday Packages Available",
  description: "Create magical memories with a birthday celebration at Baby World.",
  cta_text: "Learn More",
  cta_link: "/birthday-events",
  date_text: null as string | null,
};

export function HeroSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { data: heroCards } = useHeroCards();

  const offerCard = heroCards?.find((c) => c.type === "offer") ?? fallbackOffer;
  const eventCard = heroCards?.find((c) => c.type === "event") ?? fallbackEvent;

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => api?.scrollTo(index),
    [api]
  );

  return (
    <section id="home" className="relative py-6 sm:py-10 lg:py-14 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      <div className="container relative mx-auto">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-4 lg:gap-6 items-stretch">
          {/* Column 1 — Image Slider */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden shadow-card-hover group"
          >
            <Carousel
              setApi={setApi}
              opts={{ loop: true, align: "start" }}
              plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
              className="w-full h-full"
            >
              <CarouselContent className="h-full -ml-0">
                {slides.map((slide, i) => (
                  <CarouselItem key={i} className="pl-0 relative">
                    <div className="aspect-[4/3] lg:aspect-auto lg:h-[420px] xl:h-[460px] w-full">
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        className="w-full h-full object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                        <span className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-sm font-semibold rounded-full border border-white/20">
                          {slide.label}
                        </span>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <button
                onClick={() => api?.scrollPrev()}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </Carousel>

            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === current ? "bg-white w-6" : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Column 2 — Offer + Upcoming Event */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
            {/* Offer Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground p-5 sm:p-6 flex flex-col justify-between shadow-card-hover group hover:shadow-lg transition-shadow"
            >
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full blur-lg" />

              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                  <Gift className="w-3.5 h-3.5" />
                  {offerCard.badge}
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
                  {offerCard.title}
                </h3>
                <p className="text-sm text-white/80 leading-relaxed line-clamp-2">
                  {offerCard.description}
                </p>
              </div>

              <div className="relative z-10 mt-4">
                <Button
                  size="sm"
                  className="bg-white text-primary hover:bg-white/90 font-semibold w-full sm:w-auto"
                  asChild
                >
                  <Link to={offerCard.cta_link}>{offerCard.cta_text}</Link>
                </Button>
              </div>
            </motion.div>

            {/* Upcoming Event Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="relative rounded-2xl overflow-hidden bg-card border border-border p-5 sm:p-6 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-shadow group"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent rounded-full text-xs font-semibold text-accent-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {eventCard.badge}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                  {eventCard.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {eventCard.description}
                </p>
                {"date_text" in eventCard && eventCard.date_text && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">{eventCard.date_text}</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold w-full sm:w-auto"
                  asChild
                >
                  <Link to={eventCard.cta_link}>{eventCard.cta_text}</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
