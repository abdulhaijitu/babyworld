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
    <section className="py-24 bg-card">
      <div className="container mx-auto">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("eventsPage.trust.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("eventsPage.trust.description")}
          </p>
        </ScrollFadeIn>

        {/* Trust Grid */}
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {trustItems.map((item) => (
            <StaggerItem key={item.title}>
              <div className="group text-center space-y-4 p-6 bg-background rounded-2xl shadow-card transition-all duration-300 hover:shadow-card-hover">
                <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
