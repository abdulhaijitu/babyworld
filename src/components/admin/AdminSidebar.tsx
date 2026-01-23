import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Ticket,
  UtensilsCrossed,
  Users,
  CalendarDays,
  PartyPopper,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import babyWorldLogo from '@/assets/baby-world-logo.png';

interface MenuItem {
  id: string;
  label: string;
  labelBn: string;
  icon: React.ElementType;
  path: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', labelBn: 'ড্যাশবোর্ড', icon: LayoutDashboard, path: '/admin' },
  { id: 'ticketing', label: 'Ticketing', labelBn: 'টিকেটিং', icon: Ticket, path: '/admin/ticketing' },
  { id: 'food', label: 'Food Sales', labelBn: 'খাবার বিক্রয়', icon: UtensilsCrossed, path: '/admin/food' },
  { id: 'employees', label: 'Employees', labelBn: 'কর্মী', icon: Users, path: '/admin/employees' },
  { id: 'roster', label: 'Roster', labelBn: 'রোস্টার', icon: Clock, path: '/admin/roster' },
  { id: 'bookings', label: 'Bookings', labelBn: 'বুকিং', icon: CalendarDays, path: '/admin/bookings' },
  { id: 'events', label: 'Events', labelBn: 'ইভেন্ট', icon: PartyPopper, path: '/admin/events' },
  { id: 'settings', label: 'Settings', labelBn: 'সেটিংস', icon: Settings, path: '/admin/settings' },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onSignOut: () => void;
  userEmail?: string;
}

function SidebarContent({ 
  collapsed, 
  onCollapse, 
  onSignOut,
  userEmail,
  isMobile = false,
  onMobileClose
}: AdminSidebarProps & { isMobile?: boolean; onMobileClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-border",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src={babyWorldLogo} alt="Baby World" className="h-8 w-auto" />
            <span className="font-bold text-sm">Admin</span>
          </div>
        )}
        {collapsed && (
          <img src={babyWorldLogo} alt="Baby World" className="h-8 w-auto" />
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapse(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? (language === 'bn' ? item.labelBn : item.label) : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span>{language === 'bn' ? item.labelBn : item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className={cn(
        "border-t border-border p-3",
        collapsed && "flex flex-col items-center"
      )}>
        {!collapsed && userEmail && (
          <p className="text-xs text-muted-foreground truncate mb-2 px-1">
            {userEmail}
          </p>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={onSignOut}
          className={cn(
            "text-muted-foreground hover:text-destructive",
            !collapsed && "w-full justify-start"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">{language === 'bn' ? 'লগআউট' : 'Logout'}</span>}
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar({ collapsed, onCollapse, onSignOut, userEmail }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0">
        <SidebarContent 
          collapsed={collapsed} 
          onCollapse={onCollapse} 
          onSignOut={onSignOut}
          userEmail={userEmail}
        />
      </aside>

      {/* Mobile Trigger & Sheet */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent 
              collapsed={false} 
              onCollapse={onCollapse} 
              onSignOut={onSignOut}
              userEmail={userEmail}
              isMobile={true}
              onMobileClose={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 ml-3">
          <img src={babyWorldLogo} alt="Baby World" className="h-8 w-auto" />
          <span className="font-bold text-sm">{language === 'bn' ? 'অ্যাডমিন' : 'Admin'}</span>
        </div>
      </div>
    </>
  );
}
