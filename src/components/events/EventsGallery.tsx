import { useState } from "react";
import { Camera } from "lucide-react";
import { ScrollFadeIn, StaggerContainer, StaggerItem } from "@/components/ScrollAnimations";
import { ImageLightbox, GalleryItem } from "@/components/ImageLightbox";
import { useLanguage } from "@/contexts/LanguageContext";

import playgroundKids from "@/assets/playground-kids.jpg";
import mascotKids from "@/assets/mascot-kids.jpg";
import carouselRides from "@/assets/carousel-rides.jpg";
import arcadeGames from "@/assets/arcade-games.jpg";
import clawMachine from "@/assets/claw-machine.jpg";
import mascotClaw from "@/assets/mascot-claw.jpg";
import newYearEvent from "@/assets/new-year-event.jpg";
import tomMascot from "@/assets/tom-mascot.jpg";
import birthdayParty from "@/assets/birthday-party.jpg";

export function EventsGallery() {
  const { t, language } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const galleryImages = [
    { 
      src: playgroundKids, 
      alt: language === "bn" ? "বাচ্চারা ক্রাফট কার্যক্রমে ব্যস্ত" : "Kids enjoying craft activities" 
    },
    { 
      src: mascotKids, 
      alt: language === "bn" ? "মারিও মাসকটের সাথে বাচ্চারা" : "Kids with Mario mascot" 
    },
    { 
      src: carouselRides, 
      alt: language === "bn" ? "ক্যারোসেল ও রাইডস জোন" : "Carousel and rides zone" 
    },
    { 
      src: arcadeGames, 
      alt: language === "bn" ? "আর্কেড গেমস জোন" : "Arcade games zone" 
    },
    { 
      src: clawMachine, 
      alt: language === "bn" ? "ক্ল মেশিন গেম" : "Claw machine game" 
    },
    { 
      src: mascotClaw, 
      alt: language === "bn" ? "মাসকট লাকি গিফট দেখাচ্ছে" : "Mascot showing lucky gift" 
    },
    { 
      src: newYearEvent, 
      alt: language === "bn" ? "নববর্ষ ২০২৬ উদযাপন" : "New Year 2026 celebration" 
    },
    { 
      src: tomMascot, 
      alt: language === "bn" ? "টম মাসকটের সাথে ছোট্ট অতিথি" : "Little guest with Tom mascot" 
    },
    { 
      src: birthdayParty, 
      alt: language === "bn" ? "জন্মদিনের পার্টি উদযাপন" : "Birthday party celebration" 
    },
  ];

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="w-5 h-5 text-secondary" />
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
              {t("eventsPage.gallery.label")}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("eventsPage.gallery.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("eventsPage.gallery.description")}
          </p>
        </ScrollFadeIn>

        {/* Gallery Grid - 3 columns on desktop */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4" staggerDelay={0.08}>
          {galleryImages.map((img, i) => (
            <StaggerItem key={i}>
              <GalleryItem
                src={img.src}
                alt={img.alt}
                onClick={() => openLightbox(i)}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Gallery Note */}
        <ScrollFadeIn delay={0.3} className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            {t("eventsPage.gallery.note")} • {t("eventsPage.gallery.clickToView")}
          </p>
        </ScrollFadeIn>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={galleryImages}
        initialIndex={selectedIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </section>
  );
}
