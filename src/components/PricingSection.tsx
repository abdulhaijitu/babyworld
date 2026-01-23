import { Clock, Users, Ticket, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollFadeIn, ScaleIn } from "./ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";

export function PricingSection() {
  const { t } = useLanguage();

  const inclusions = [
    t("pricing.inclusion1"),
    t("pricing.inclusion2"),
    t("pricing.inclusion3"),
    t("pricing.inclusion4"),
    t("pricing.inclusion5"),
  ];

  const rules = [
    { icon: "👧", text: t("pricing.rule1") },
    { icon: "🧴", text: t("pricing.rule2") },
    { icon: "🍱", text: t("pricing.rule3") },
    { icon: "👨‍👩‍👧", text: t("pricing.rule4") },
  ];

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            {t("pricing.label")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("pricing.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("pricing.description")}
          </p>
        </ScrollFadeIn>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Hourly Play Card */}
          <ScaleIn className="lg:col-span-2">
            <div className="bg-card rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-shadow duration-300 h-full">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left side */}
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {t("pricing.hourlyPlay")}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {t("pricing.sessionTitle")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("pricing.sessionDesc")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span>{t("pricing.childGuardian")}</span>
                  </div>

                  <Button size="lg" className="w-full sm:w-auto">
                    {t("pricing.bookSession")}
                  </Button>
                </div>

                {/* Right side - inclusions */}
                <div className="flex-1 bg-accent rounded-2xl p-6">
                  <h4 className="font-semibold text-foreground mb-4">
                    {t("pricing.whatsIncluded")}
                  </h4>
                  <ul className="space-y-3">
                    {inclusions.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </ScaleIn>

          {/* Physical Ticket Card */}
          <ScaleIn delay={0.15}>
            <div className="bg-muted rounded-3xl p-8 h-full">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-foreground/5 rounded-full">
                  <Ticket className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {t("pricing.walkIn")}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {t("pricing.physicalTickets")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("pricing.physicalDesc")}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {t("pricing.noBooking")}
                  </p>
                </div>
              </div>
            </div>
          </ScaleIn>
        </div>

        {/* Play Rules */}
        <ScrollFadeIn delay={0.2}>
          <div className="mt-16 bg-accent rounded-3xl p-8 lg:p-12 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">
              {t("pricing.guidelines")}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {rules.map((rule) => (
                <div key={rule.text} className="text-center">
                  <span className="text-3xl">{rule.icon}</span>
                  <p className="mt-2 text-sm text-muted-foreground">{rule.text}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
