import { Shield, Users, Sparkles, Wind } from "lucide-react";
import { ScrollFadeIn, StaggerContainer, StaggerItem } from "@/components/ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";

export function EventsTrust() {
  const { t } = useLanguage();

  const trustItems = [
    {
      icon: Shield,
      title: t("trust.safePlay"),
      description: t("trust.safePlayDesc"),
    },
    {
      icon: Users,
      title: t("trust.trainedStaff"),
      description: t("trust.trainedStaffDesc"),
    },
    {
      icon: Sparkles,
      title: t("trust.childFriendly"),
      description: t("trust.childFriendlyDesc"),
    },
    {
      icon: Wind,
      title: t("trust.cleanHygienic"),
      description: t("trust.cleanHygienicDesc"),
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-card overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 lg:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("eventsPage.trust.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("eventsPage.trust.description")}
          </p>
        </ScrollFadeIn>

        {/* Trust Grid */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" staggerDelay={0.1}>
          {trustItems.map((item) => (
            <StaggerItem key={item.title}>
              <div className="group text-center space-y-2 sm:space-y-4 p-4 sm:p-6 bg-background rounded-xl sm:rounded-2xl shadow-card transition-all duration-300 hover:shadow-card-hover">
                <div className="inline-flex w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
