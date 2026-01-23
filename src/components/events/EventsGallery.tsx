import { Camera } from "lucide-react";
import { ScrollFadeIn, StaggerContainer, StaggerItem } from "@/components/ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";

import celebration1 from "@/assets/celebration-1.jpg";
import celebration2 from "@/assets/celebration-2.jpg";
import celebration3 from "@/assets/celebration-3.jpg";
import celebration4 from "@/assets/celebration-4.jpg";

export function EventsGallery() {
  const { t, language } = useLanguage();

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
              <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
                <img 
                  src={img.src} 
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium line-clamp-2">{img.alt}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Gallery Note */}
        <ScrollFadeIn delay={0.3} className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            {t("eventsPage.gallery.note")}
          </p>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
