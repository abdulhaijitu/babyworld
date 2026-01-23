import { Gift, Camera, Cake, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollFadeIn, StaggerContainer, StaggerItem } from "./ScrollAnimations";

import celebration1 from "@/assets/celebration-1.jpg";
import celebration2 from "@/assets/celebration-2.jpg";
import celebration3 from "@/assets/celebration-3.jpg";
import celebration4 from "@/assets/celebration-4.jpg";

const celebrationImages = [
  { src: celebration1, alt: "বাচ্চাদের জন্মদিনের পার্টি উদযাপন" },
  { src: celebration2, alt: "জন্মদিনের কেক ও মোমবাতি" },
  { src: celebration3, alt: "উপহার ও পার্টি হ্যাট পরা বাচ্চারা" },
  { src: celebration4, alt: "জন্মদিনের পার্টি টেবিল সাজানো" },
];

const packages = [
  {
    name: "Basic Celebration",
    description: "Perfect for intimate gatherings with close friends",
    features: ["2 hours private area", "Basic decorations", "Play zone access"],
    icon: Cake,
  },
  {
    name: "Premium Party",
    description: "A memorable celebration with all the extras",
    features: [
      "3 hours private area",
      "Theme decorations",
      "Photography session",
      "Party host assistance",
    ],
    icon: Gift,
    popular: true,
  },
  {
    name: "Grand Event",
    description: "The ultimate birthday experience",
    features: [
      "4 hours exclusive area",
      "Custom theme setup",
      "Professional photography",
      "Entertainment activities",
      "Dedicated party coordinator",
    ],
    icon: Music,
  },
];

export function EventsSection() {
  return (
    <section id="events" className="py-24 bg-card">
      <div className="container mx-auto">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
            Birthday & Events
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Celebrate Special Moments
          </h2>
          <p className="text-lg text-muted-foreground">
            Create magical memories with a birthday celebration at Baby World.
            Safe, joyful, and unforgettable experiences await!
          </p>
        </ScrollFadeIn>

        {/* Packages */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.15}>
          {packages.map((pkg) => (
            <StaggerItem key={pkg.name}>
              <div
                className={`relative bg-background rounded-3xl p-8 transition-all duration-300 hover:shadow-card-hover h-full ${
                  pkg.popular
                    ? "ring-2 ring-secondary shadow-card-hover"
                    : "shadow-card"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      pkg.popular ? "bg-secondary/10" : "bg-primary/10"
                    }`}
                  >
                    <pkg.icon
                      className={`w-7 h-7 ${
                        pkg.popular ? "text-secondary" : "text-primary"
                      }`}
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {pkg.description}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            pkg.popular ? "bg-secondary" : "bg-primary"
                          }`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={pkg.popular ? "secondary" : "outline"}
                    className="w-full"
                  >
                    Inquire Now
                  </Button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Photo Gallery Preview */}
        <ScrollFadeIn delay={0.2} className="mt-20">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Camera className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">
              Celebration Moments
            </h3>
          </div>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" staggerDelay={0.1}>
            {celebrationImages.map((img, i) => (
              <StaggerItem key={i}>
                <div className="aspect-square rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300 shadow-card">
                  <img 
                    src={img.src} 
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
