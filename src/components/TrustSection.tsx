import { Shield, Users, Sparkles, Wind } from "lucide-react";
import { ScrollFadeIn, StaggerContainer, StaggerItem } from "./ScrollAnimations";

const trustItems = [
  {
    icon: Shield,
    title: "Safe Play Environment",
    description:
      "Soft, child-friendly equipment with rounded edges and padded surfaces throughout.",
  },
  {
    icon: Users,
    title: "Trained Staff",
    description:
      "Our team is trained in child safety and first aid, ensuring supervision at all times.",
  },
  {
    icon: Sparkles,
    title: "Child-Friendly Equipment",
    description:
      "Age-appropriate play structures designed for children aged 1–10 years.",
  },
  {
    icon: Wind,
    title: "Clean & Hygienic",
    description:
      "Regular sanitization of all equipment and air-conditioned, well-ventilated space.",
  },
];

export function TrustSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Trust & Safety
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Your Child's Safety is Our Priority
          </h2>
          <p className="text-lg text-muted-foreground">
            We understand that as parents, nothing matters more than your
            child's well-being. That's why we've built Baby World with safety at
            its core.
          </p>
        </ScrollFadeIn>

        {/* Trust Grid */}
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.12}>
          {trustItems.map((item) => (
            <StaggerItem key={item.title}>
              <div className="group text-center space-y-4 p-6 rounded-2xl transition-all duration-300 hover:bg-card hover:shadow-card">
                <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Trust Statement */}
        <ScrollFadeIn delay={0.3} className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-accent rounded-2xl">
            <span className="text-3xl">💚</span>
            <p className="text-foreground font-medium">
              "I can trust this place with my child."
            </p>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
