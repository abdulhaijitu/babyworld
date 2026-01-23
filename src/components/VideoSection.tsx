import { useState } from "react";
import { Play, X } from "lucide-react";
import { ScrollFadeIn } from "./ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import playgroundKids from "@/assets/playground-kids.jpg";
import mascotKids from "@/assets/mascot-kids.jpg";
import carouselRides from "@/assets/carousel-rides.jpg";

export function VideoSection() {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  // Baby World playground video
  const videoId = "v9fVa72l-Jg";

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12 space-y-3 sm:space-y-4">
          <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
            {language === "bn" ? "ভার্চুয়াল ট্যুর" : "Virtual Tour"}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            {language === "bn" ? "প্লেগ্রাউন্ড দেখুন" : "See Our Playground"}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            {language === "bn" 
              ? "আমাদের নিরাপদ ও মজার প্লে এরিয়া দেখুন যেখানে আপনার সন্তান খেলতে পারবে" 
              : "Take a look at our safe and fun play areas where your child can explore"}
          </p>
        </ScrollFadeIn>

        {/* Video Player / Thumbnail */}
        <ScrollFadeIn delay={0.2}>
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {!isPlaying ? (
                <motion.div
                  key="thumbnail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-card-hover cursor-pointer group"
                  onClick={() => setIsPlaying(true)}
                >
                {/* Main thumbnail image */}
                  <img 
                    src={playgroundKids} 
                    alt={language === "bn" ? "বেবি ওয়ার্ল্ড প্লেগ্রাউন্ডে বাচ্চারা খেলছে" : "Kids playing at Baby World playground"}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/20 group-hover:from-foreground/70 group-hover:via-foreground/30 transition-all duration-300" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:bg-primary/90 transition-colors"
                    >
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary-foreground ml-1" />
                    </motion.div>
                  </div>
                  
                  {/* Text overlay */}
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-center">
                    <p className="text-white text-sm sm:text-base lg:text-lg font-medium">
                      {language === "bn" ? "ভিডিও দেখতে ক্লিক করুন" : "Click to watch video"}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-card-hover"
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title="Baby World Playground Tour"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                  
                  {/* Close button */}
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 rounded-full bg-foreground/80 text-background flex items-center justify-center hover:bg-foreground transition-colors z-10"
                    aria-label="Close video"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollFadeIn>

        {/* Feature highlights */}
        <ScrollFadeIn delay={0.3}>
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto mt-8 sm:mt-10 lg:mt-12">
            <div className="text-center space-y-1 sm:space-y-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl">🎠</span>
              <p className="text-xs sm:text-sm font-medium text-foreground">
                {language === "bn" ? "ক্যারোসেল রাইড" : "Carousel Rides"}
              </p>
            </div>
            <div className="text-center space-y-1 sm:space-y-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl">🎮</span>
              <p className="text-xs sm:text-sm font-medium text-foreground">
                {language === "bn" ? "আর্কেড গেমস" : "Arcade Games"}
              </p>
            </div>
            <div className="text-center space-y-1 sm:space-y-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl">🏰</span>
              <p className="text-xs sm:text-sm font-medium text-foreground">
                {language === "bn" ? "সফট প্লে" : "Soft Play"}
              </p>
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
