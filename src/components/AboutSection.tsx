import { Heart, Sparkles, Users } from "lucide-react";
import { ScrollFadeIn, StaggerContainer, StaggerItem } from "./ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";

export function AboutSection() {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-24 bg-card">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <ScrollFadeIn direction="left">
            <div className="relative bg-accent rounded-3xl p-8 lg:p-12">
              <StaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.15}>
                <div className="space-y-4">
                  <StaggerItem>
                    <div className="bg-card rounded-2xl p-6 shadow-card">
                      <span className="text-4xl">🏰</span>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {t("about.adventureZone")}
                      </p>
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <div className="bg-card rounded-2xl p-6 shadow-card">
                      <span className="text-4xl">📚</span>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {t("about.learningCorner")}
                      </p>
                    </div>
                  </StaggerItem>
                </div>
                <div className="space-y-4 pt-8">
                  <StaggerItem>
                    <div className="bg-card rounded-2xl p-6 shadow-card">
                      <span className="text-4xl">🎨</span>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {t("about.creativeSpace")}
                      </p>
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <div className="bg-card rounded-2xl p-6 shadow-card">
                      <span className="text-4xl">🎭</span>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {t("about.pretendPlay")}
                      </p>
                    </div>
                  </StaggerItem>
                </div>
              </StaggerContainer>
            </div>
          </ScrollFadeIn>

          {/* Content */}
          <div className="space-y-8">
            <ScrollFadeIn>
              <div className="space-y-4">
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                  {t("about.label")}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {t("about.title")}{" "}
                  <span className="text-primary">{t("about.titleHighlight")}</span>
                </h2>
              </div>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.1}>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("about.description")}
              </p>
            </ScrollFadeIn>

            <div className="space-y-6">
              <ScrollFadeIn delay={0.2}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {t("about.safeHygienic")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("about.safeHygienicDesc")}
                    </p>
                  </div>
                </div>
              </ScrollFadeIn>

              <ScrollFadeIn delay={0.3}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {t("about.trainedStaff")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("about.trainedStaffDesc")}
                    </p>
                  </div>
                </div>
              </ScrollFadeIn>

              <ScrollFadeIn delay={0.4}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {t("about.ageAppropriate")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("about.ageAppropriateDesc")}
                    </p>
                  </div>
                </div>
              </ScrollFadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
