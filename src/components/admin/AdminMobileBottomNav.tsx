import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Ticket, UtensilsCrossed, PartyPopper, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminMobileBottomNavProps {
  onMenuClick: () => void;
}

const tabs = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Ticket, label: "Tickets", path: "/admin/create-ticket" },
  { icon: UtensilsCrossed, label: "Food POS", path: "/admin/food-pos" },
  { icon: PartyPopper, label: "Events", path: "/admin/event-packages" },
];

export function AdminMobileBottomNav({ onMenuClick }: AdminMobileBottomNavProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;

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

  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin" || location.pathname === "/admin/"
      : location.pathname.startsWith(path);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-safe mb-2"
        >
          <TooltipProvider delayDuration={0}>
            <nav className="flex items-center gap-1 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl px-2 py-2 shadow-[0_-4px_30px_-4px_rgba(0,0,0,0.15)]">
              {tabs.map((tab, index) => {
                const active = isActive(tab.path);
                const Icon = tab.icon;
                const isHovered = hoveredIndex === index;

                return (
                  <Tooltip key={tab.path}>
                    <TooltipTrigger asChild>
                      <motion.div
                        onHoverStart={() => setHoveredIndex(index)}
                        onHoverEnd={() => setHoveredIndex(null)}
                        onTapStart={() => setHoveredIndex(index)}
                        onTap={() => setHoveredIndex(null)}
                        animate={{
                          scale: isHovered ? 1.2 : 1,
                          rotate: isHovered ? -5 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative flex flex-col items-center"
                      >
                        <Link
                          to={tab.path}
                          className={cn(
                            "relative flex items-center justify-center w-11 h-11 rounded-xl transition-colors duration-200",
                            active
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          <Icon className="w-5 h-5 relative z-10" strokeWidth={active ? 2.5 : 2} />

                          {/* Glowing ring effect */}
                          <AnimatePresence>
                            {(isHovered || active) && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="absolute inset-0 rounded-xl bg-primary/15 blur-sm"
                              />
                            )}
                          </AnimatePresence>
                        </Link>

                        {/* Active indicator */}
                        {active && (
                          <motion.div
                            layoutId="adminDockIndicator"
                            className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {tab.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* Divider */}
              <div className="w-px h-6 bg-border/50 mx-1" />

              {/* More button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    onHoverStart={() => setHoveredIndex(99)}
                    onHoverEnd={() => setHoveredIndex(null)}
                    animate={{
                      scale: hoveredIndex === 99 ? 1.2 : 1,
                      rotate: hoveredIndex === 99 ? -5 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative flex flex-col items-center"
                  >
                    <button
                      onClick={onMenuClick}
                      className="relative flex items-center justify-center w-11 h-11 rounded-xl text-muted-foreground transition-colors duration-200"
                    >
                      <Menu className="w-5 h-5 relative z-10" strokeWidth={2} />
                      <AnimatePresence>
                        {hoveredIndex === 99 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 rounded-xl bg-primary/15 blur-sm"
                          />
                        )}
                      </AnimatePresence>
                    </button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  More
                </TooltipContent>
              </Tooltip>
            </nav>
          </TooltipProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
