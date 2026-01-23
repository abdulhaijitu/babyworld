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
    <section className="py-16 sm:py-20 lg:py-24 bg-card overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 lg:mb-16 space-y-3 sm:space-y-4">
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
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8" staggerDelay={0.15}>
          {testimonials.map((testimonial, index) => (
            <StaggerItem key={index}>
              <div className="bg-background rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-card h-full flex flex-col">
                {/* Quote Icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 sm:mb-6">
                  <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                </div>

                {/* Rating */}
                <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary fill-secondary" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-sm sm:text-base text-foreground leading-relaxed flex-1 mb-4 sm:mb-6">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-base sm:text-lg font-semibold text-primary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base truncate">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Trust Statement */}
        <ScrollFadeIn delay={0.3} className="text-center mt-8 sm:mt-10 lg:mt-12">
          <p className="text-sm sm:text-base lg:text-lg font-medium text-muted-foreground italic px-4">
            {t("testimonials.trustStatement")}
          </p>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
