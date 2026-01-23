import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollFadeIn, ScaleIn } from "./ScrollAnimations";
import { ContactForm } from "./ContactForm";
import { useLanguage } from "@/contexts/LanguageContext";

export function ContactSection() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-16 sm:py-20 lg:py-24 bg-card overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Contact Info */}
          <div className="space-y-8">
            <ScrollFadeIn>
              <div className="space-y-4">
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                  {t("contact.label")}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  {t("contact.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("contact.description")}
                </p>
              </div>
            </ScrollFadeIn>

            <div className="space-y-6">
              <ScrollFadeIn delay={0.1}>
                <a
                  href="tel:09606990128"
                  className="flex items-start gap-4 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t("contact.phone")}</p>
                    <p className="text-muted-foreground group-hover:text-primary transition-colors">
                      09606990128
                    </p>
                  </div>
                </a>
              </ScrollFadeIn>

              <ScrollFadeIn delay={0.15}>
                <a
                  href="mailto:babyworld.dm@gmail.com"
                  className="flex items-start gap-4 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t("contact.email")}</p>
                    <p className="text-muted-foreground group-hover:text-primary transition-colors">
                      babyworld.dm@gmail.com
                    </p>
                  </div>
                </a>
              </ScrollFadeIn>

              <ScrollFadeIn delay={0.2}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t("contact.address")}</p>
                    <p className="text-muted-foreground">
                      {t("contact.addressLine1")}
                      <br />
                      {t("contact.addressLine2")}
                    </p>
                  </div>
                </div>
              </ScrollFadeIn>

              <ScrollFadeIn delay={0.25}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t("contact.hours")}</p>
                    <p className="text-muted-foreground">
                      {t("contact.hoursLine1")}
                      <br />
                      {t("contact.hoursLine2")}
                    </p>
                  </div>
                </div>
              </ScrollFadeIn>
            </div>

            <ScrollFadeIn delay={0.3}>
              <Button size="lg" className="mt-4">
                {t("contact.getDirections")}
              </Button>
            </ScrollFadeIn>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
