import { useState } from "react";
import { Camera } from "lucide-react";
import { ScrollFadeIn, StaggerContainer, StaggerItem } from "@/components/ScrollAnimations";
import { ImageLightbox, GalleryItem } from "@/components/ImageLightbox";
import { useLanguage } from "@/contexts/LanguageContext";

import celebration1 from "@/assets/celebration-1.jpg";
import celebration2 from "@/assets/celebration-2.jpg";
import celebration3 from "@/assets/celebration-3.jpg";
import celebration4 from "@/assets/celebration-4.jpg";

export function EventsGallery() {
  const { t, language } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const galleryImages = [
    { 
      src: celebration1, 
      alt: language === "bn" ? "বাচ্চাদের জন্মদিনের পার্টি উদযাপন" : "Birthday party celebration" 
    },
    { 
      src: celebration2, 
      alt: language === "bn" ? "জন্মদিনের কেক ও মোমবাতি" : "Birthday cake with candles" 
    },
    { 
      src: celebration3, 
      alt: language === "bn" ? "উপহার ও পার্টি হ্যাট পরা বাচ্চারা" : "Children with gifts and party hats" 
    },
    { 
      src: celebration4, 
      alt: language === "bn" ? "জন্মদিনের পার্টি টেবিল সাজানো" : "Birthday party table setup" 
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

        {/* Gallery Grid */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" staggerDelay={0.1}>
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
