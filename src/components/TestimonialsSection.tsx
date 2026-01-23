import { Star, Quote } from "lucide-react";
import { ScrollFadeIn, StaggerContainer, StaggerItem } from "./ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";

export function TestimonialsSection() {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: t("testimonials.parent1.name"),
      role: t("testimonials.parent1.role"),
      quote: t("testimonials.parent1.quote"),
      rating: 5,
    },
    {
      name: t("testimonials.parent2.name"),
      role: t("testimonials.parent2.role"),
      quote: t("testimonials.parent2.quote"),
      rating: 5,
    },
    {
      name: t("testimonials.parent3.name"),
      role: t("testimonials.parent3.role"),
      quote: t("testimonials.parent3.quote"),
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
            {t("testimonials.label")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("testimonials.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("testimonials.description")}
          </p>
        </ScrollFadeIn>

        {/* Testimonials Grid */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.15}>
          {testimonials.map((testimonial, index) => (
            <StaggerItem key={index}>
              <div className="bg-background rounded-3xl p-8 shadow-card h-full flex flex-col">
                {/* Quote Icon */}
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                  <Quote className="w-6 h-6 text-secondary" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-secondary fill-secondary" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-foreground leading-relaxed flex-1 mb-6">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-border">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Trust Statement */}
        <ScrollFadeIn delay={0.3} className="text-center mt-12">
          <p className="text-lg font-medium text-muted-foreground italic">
            {t("testimonials.trustStatement")}
          </p>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
