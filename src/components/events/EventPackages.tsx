import { Gift, Cake, Music, Crown, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollFadeIn, StaggerContainer, StaggerItem } from "@/components/ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface EventPackagesProps {
  selectedPackage: string | null;
  onSelectPackage: (packageId: string) => void;
}

export function EventPackages({ selectedPackage, onSelectPackage }: EventPackagesProps) {
  const { t } = useLanguage();

  const packages = [
    {
      id: "basic",
      name: t("events.basicName"),
      description: t("events.basicDesc"),
      duration: "2",
      features: [
        t("events.feature.2hours"),
        t("events.feature.basicDecor"),
        t("events.feature.playzone"),
      ],
      icon: Cake,
    },
    {
      id: "premium",
      name: t("events.premiumName"),
      description: t("events.premiumDesc"),
      duration: "3",
      features: [
        t("events.feature.3hours"),
        t("events.feature.themeDecor"),
        t("events.feature.photo"),
        t("events.feature.host"),
      ],
      icon: Gift,
      popular: true,
    },
    {
      id: "grand",
      name: t("events.grandName"),
      description: t("events.grandDesc"),
      duration: "4",
      features: [
        t("events.feature.4hours"),
        t("events.feature.customTheme"),
        t("events.feature.proPhoto"),
        t("events.feature.entertainment"),
        t("events.feature.coordinator"),
      ],
      icon: Music,
    },
    {
      id: "custom",
      name: t("eventsPage.packages.customName"),
      description: t("eventsPage.packages.customDesc"),
      duration: "5+",
      features: [
        t("eventsPage.packages.feature.5hours"),
        t("eventsPage.packages.feature.fullCustom"),
        t("eventsPage.packages.feature.catering"),
        t("eventsPage.packages.feature.vip"),
      ],
      icon: Crown,
    },
  ];

  return (
    <section id="packages" className="py-24 bg-card">
      <div className="container mx-auto">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
            {t("eventsPage.packages.label")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("eventsPage.packages.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("eventsPage.packages.description")}
          </p>
        </ScrollFadeIn>

        {/* Package Cards */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {packages.map((pkg) => {
            const isSelected = selectedPackage === pkg.id;
            
            return (
              <StaggerItem key={pkg.id}>
                <div
                  className={cn(
                    "relative bg-background rounded-3xl p-6 transition-all duration-300 h-full cursor-pointer group",
                    isSelected
                      ? "ring-2 ring-secondary shadow-card-hover scale-[1.02]"
                      : "shadow-card hover:shadow-card-hover hover:scale-[1.01]",
                    pkg.popular && !isSelected && "ring-1 ring-secondary/30"
                  )}
                  onClick={() => onSelectPackage(pkg.id)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
                        {t("events.mostPopular")}
                      </span>
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* Icon & Duration */}
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                          isSelected ? "bg-secondary/20" : "bg-primary/10 group-hover:bg-secondary/10"
                        )}
                      >
                        <pkg.icon
                          className={cn(
                            "w-6 h-6 transition-colors",
                            isSelected ? "text-secondary" : "text-primary group-hover:text-secondary"
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{pkg.duration}h</span>
                      </div>
                    </div>

                    {/* Name & Description */}
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {pkg.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {pkg.description}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2">
                      {pkg.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Check className={cn(
                            "w-4 h-4 flex-shrink-0",
                            isSelected ? "text-secondary" : "text-primary"
                          )} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Age Range Badge */}
                    <div className="pt-2">
                      <span className="inline-flex items-center px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                        {t("eventsPage.packages.ageRange")}
                      </span>
                    </div>

                    {/* Price Placeholder */}
                    <div className="pt-2 border-t border-border">
                      <div className="h-5 w-32 bg-muted rounded animate-pulse mb-3" />
                      <p className="text-xs text-muted-foreground">
                        {t("eventsPage.packages.priceNote")}
                      </p>
                    </div>

                    {/* Select Button */}
                    <Button
                      variant={isSelected ? "secondary" : "outline"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPackage(pkg.id);
                      }}
                    >
                      {isSelected ? t("eventsPage.packages.selectedPackage") : t("eventsPage.packages.selectPackage")}
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
