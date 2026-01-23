import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollFadeIn } from "./ScrollAnimations";

export function GoogleMap() {
  const { t } = useLanguage();

  // Baby World location in Lalbagh, Dhaka
  const googleMapsUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.3!2d90.388!3d23.719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQzJzA4LjQiTiA5MMKwMjMnMTcuNiJF!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd";
  
  const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=23.7195,90.3882&destination_place_id=Baby+World+Lalbagh+Dhaka";

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto">
        <ScrollFadeIn>
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t("contact.findUs")}</h3>
                  <p className="text-sm text-muted-foreground">{t("contact.addressLine1")}, {t("contact.addressLine2")}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={directionsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("contact.getDirections")}
                </a>
              </Button>
            </div>

            {/* Map Container */}
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-card border border-border">
              <iframe
                src={googleMapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Baby World Location - Lalbagh, Dhaka"
                className="w-full h-full"
              />
              
              {/* Overlay with location info */}
              <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🏠</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Baby World</p>
                    <p className="text-xs text-muted-foreground">
                      {t("contact.addressLine1")}<br />
                      {t("contact.addressLine2")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                <span className="text-2xl">🚗</span>
                <div>
                  <p className="font-medium text-sm text-foreground">{t("contact.parking")}</p>
                  <p className="text-xs text-muted-foreground">{t("contact.parkingInfo")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                <span className="text-2xl">🚌</span>
                <div>
                  <p className="font-medium text-sm text-foreground">{t("contact.publicTransport")}</p>
                  <p className="text-xs text-muted-foreground">{t("contact.transportInfo")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="font-medium text-sm text-foreground">{t("contact.landmark")}</p>
                  <p className="text-xs text-muted-foreground">{t("contact.landmarkInfo")}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
