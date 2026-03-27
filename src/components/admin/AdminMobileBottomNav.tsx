import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Ticket, UtensilsCrossed, PartyPopper, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin" || location.pathname === "/admin/"
      : location.pathname.startsWith(path);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around px-1 py-2 pb-safe">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-2 min-w-[3.5rem] rounded-xl transition-all duration-200",
                active ? "text-primary" : "text-muted-foreground active:scale-95"
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
                active && "bg-primary/10"
              )}>
                <Icon className={cn("w-5 h-5", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center py-1.5 px-2 min-w-[3.5rem] rounded-xl transition-all duration-200 text-muted-foreground active:scale-95"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl">
            <Menu className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="text-[10px] mt-0.5 font-medium text-muted-foreground">More</span>
        </button>
      </div>
    </nav>
  );
}
