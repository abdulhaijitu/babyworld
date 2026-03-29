import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { t } from "@/lib/translations";
import { WhatsAppButton } from "./WhatsAppButton";
import { SocialLinks } from "./SocialLinks";
import babyWorldLogo from "@/assets/baby-world-logo.png";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function formatTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function Footer() {
  const { data: businessInfo } = useQuery({
    queryKey: ['business-info-footer'],
    queryFn: async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'business_info')
        .maybeSingle();
      return data?.value as Record<string, string> | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const openingTime = businessInfo?.openingTime || businessInfo?.openTime || '10:00';
  const closingTime = businessInfo?.closingTime || businessInfo?.closeTime || '21:00';

  const quickLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.pricing"), href: "/play-booking" },
    { label: t("nav.events"), href: "/birthday-events" },
    { label: t("footer.gallery"), href: "/gallery" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  return (
    <footer className="bg-foreground text-background pt-12 sm:pt-16 pb-24 lg:pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4 text-center sm:text-left">
            <Link to="/" className="inline-block">
              <img 
                src={babyWorldLogo} 
                alt="Baby World Indoor Playground logo"
                className="h-16 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm opacity-80">
              <span className="font-semibold">Baby World</span>
              <span>•</span>
              <span>বেবি ওয়ার্ল্ড</span>
            </div>
            <p className="text-sm opacity-70 max-w-md">
              {t("footer.description")}
            </p>
            <p className="text-sm font-medium opacity-90">{t("hero.learnPlay")}</p>
            
            <div className="space-y-2">
              <p className="text-xs opacity-60">{t("footer.followUs")}</p>
              <SocialLinks variant="footer" />
            </div>
            
            <WhatsAppButton variant="footer" />
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm opacity-70 hover:opacity-100 hover:underline underline-offset-4 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t("footer.openingHours")}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm opacity-70">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium opacity-100">{t("footer.everyday")}</p>
                  <p>{formatTime(openingTime)} – {formatTime(closingTime)}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t("footer.contact")}</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:09606990128"
                  className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  09606990128
                </a>
              </li>
              <li>
                <a
                  href="mailto:babyworld.dm@gmail.com"
                  className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  babyworld.dm@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm opacity-70">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {t("contact.addressLine1")}
                  <br />
                  {t("contact.addressLine2")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-background/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm opacity-60">
              © {new Date().getFullYear()} Baby World. {t("footer.rights")}
            </p>
            <p className="text-xs sm:text-sm opacity-60">{t("footer.ageRange")} • {t("hero.learnPlay")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
