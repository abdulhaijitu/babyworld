import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollFadeIn } from "@/components/ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";

export function EventsFAQ() {
  const { t } = useLanguage();

  const faqItems = [
    {
      question: t("eventsFAQ.q1"),
      answer: t("eventsFAQ.a1"),
    },
    {
      question: t("eventsFAQ.q2"),
      answer: t("eventsFAQ.a2"),
    },
    {
      question: t("eventsFAQ.q3"),
      answer: t("eventsFAQ.a3"),
    },
    {
      question: t("eventsFAQ.q4"),
      answer: t("eventsFAQ.a4"),
    },
    {
      question: t("eventsFAQ.q5"),
      answer: t("eventsFAQ.a5"),
    },
    {
      question: t("eventsFAQ.q6"),
      answer: t("eventsFAQ.a6"),
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              {t("eventsFAQ.label")}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("eventsFAQ.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("eventsFAQ.description")}
          </p>
        </ScrollFadeIn>

        {/* FAQ Accordion */}
        <ScrollFadeIn delay={0.2} className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl sm:rounded-2xl px-4 sm:px-6 shadow-card border-none"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base text-foreground font-medium hover:no-underline py-4 sm:py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 sm:pb-5 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollFadeIn>

        {/* Contact Note */}
        <ScrollFadeIn delay={0.3} className="text-center mt-8 sm:mt-10">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("eventsFAQ.moreQuestions")}{" "}
            <a href="/contact" className="text-primary hover:underline font-medium">
              {t("eventsFAQ.contactUs")}
            </a>
          </p>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
