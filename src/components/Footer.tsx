import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WhatsAppButton } from "./WhatsAppButton";

export function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.pricing"), href: "/play-booking" },
    { label: t("nav.events"), href: "/birthday-events" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-2xl font-bold">Baby World</h3>
              <p className="text-lg opacity-80 font-bangla">বেবি ওয়ার্ল্ড</p>
            </div>
            <p className="text-sm opacity-70 max-w-md">
              {t("footer.description")}
            </p>
            <p className="text-sm font-medium opacity-90">{t("hero.learnPlay")}</p>
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
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
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
                  <Phone className="w-4 h-4" />
                  09606990128
                </a>
              </li>
              <li>
                <a
                  href="mailto:babyworld.dm@gmail.com"
                  className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <Mail className="w-4 h-4" />
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
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm opacity-60">
              © {new Date().getFullYear()} Baby World (<span className="font-bangla">বেবি ওয়ার্ল্ড</span>). {t("footer.rights")}
            </p>
            <p className="text-sm opacity-60">{t("footer.ageRange")} • {t("hero.learnPlay")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
