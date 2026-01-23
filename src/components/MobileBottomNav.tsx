import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, CalendarDays, PartyPopper, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface NavItem {
  icon: typeof Home;
  labelEn: string;
  labelBn: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, labelEn: "Home", labelBn: "হোম", href: "/" },
  { icon: CalendarDays, labelEn: "Booking", labelBn: "বুকিং", href: "/play-booking" },
  { icon: PartyPopper, labelEn: "Events", labelBn: "ইভেন্ট", href: "/birthday-events" },
  { icon: Phone, labelEn: "Contact", labelBn: "যোগাযোগ", href: "/contact" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;
      
      // Show nav when scrolling up or at top, hide when scrolling down significantly
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (scrollDiff > 10) {
        setIsVisible(false);
      } else if (scrollDiff < -10) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]"
        >
          {/* Safe area padding for iOS devices */}
          <div className="flex items-center justify-around px-2 py-2 pb-safe">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              const label = language === "bn" ? item.labelBn : item.labelEn;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-3 min-w-[4.5rem] rounded-xl transition-all duration-200",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground active:scale-95"
                  )}
                >
                  <div
                    className={cn(
                      "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                      isActive && "bg-primary/10"
                    )}
                  >
                    <Icon 
                      className={cn(
                        "w-5 h-5 transition-all duration-200",
                        isActive && "scale-110"
                      )} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavIndicator"
                        className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>
                  <span 
                    className={cn(
                      "text-[10px] mt-0.5 font-medium transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
