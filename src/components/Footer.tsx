import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-2xl font-bold">Baby World</h3>
              <p className="text-lg opacity-80">বেবি ওয়ার্ল্ড</p>
            </div>
            <p className="text-sm opacity-70 max-w-md">
              A safe, hygienic, and joyful indoor playground for children aged
              1–10 years. Where kids learn & play in a supervised, nurturing
              environment.
            </p>
            <p className="text-sm font-medium opacity-90">Learn & Play</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "#home" },
                { label: "About Us", href: "#about" },
                { label: "Play & Pricing", href: "#pricing" },
                { label: "Birthday & Events", href: "#events" },
                { label: "Contact", href: "#contact" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact</h4>
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
                  27/B, Jannat Tower (Lift #3),
                  <br />
                  Lalbagh, Dhaka 1211
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm opacity-60">
              © {new Date().getFullYear()} Baby World (বেবি ওয়ার্ল্ড). All rights
              reserved.
            </p>
            <p className="text-sm opacity-60">Ages 1–10 Years • Learn & Play</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
