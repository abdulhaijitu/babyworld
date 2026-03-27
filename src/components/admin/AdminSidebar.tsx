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
  ChevronDown,
  Menu,
  LogOut,
  LogIn,
  Clock,
  FileBarChart,
  Shield,
  Video,
  Crown,
  Receipt,
  TrendingUp,
  FerrisWheel,
  Star,
  MessageSquare,
  Home,
  Monitor,
  Plus,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useMemo, useEffect } from 'react';
import { useUserRoles, type AppRole } from '@/hooks/useUserRoles';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import babyWorldLogo from '@/assets/baby-world-logo.png';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  requiredRoles?: AppRole[];
  children?: { id: string; label: string; icon: React.ElementType; path: string }[];
}

const allMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: '/admin/create-ticket', requiredRoles: ['super_admin', 'admin', 'manager', 'staff'], children: [
    { id: 'create-ticket', label: 'Create Ticket', icon: Plus, path: '/admin/create-ticket' },
    { id: 'ticket-list', label: 'Ticket List', icon: List, path: '/admin/ticket-list' },
    { id: 'rides', label: 'Rides', icon: FerrisWheel, path: '/admin/rides' },
    { id: 'gate-logs', label: 'Gate Logs', icon: Video, path: '/admin/gate-logs' },
  ]},
  { id: 'membership', label: 'Membership', icon: Crown, path: '/admin/membership-packages', requiredRoles: ['super_admin', 'admin', 'manager'], children: [
    { id: 'membership-packages', label: 'Packages', icon: List, path: '/admin/membership-packages' },
    { id: 'memberships', label: 'All Members', icon: Crown, path: '/admin/memberships' },
    { id: 'member-entry', label: 'Member Entry', icon: LogIn, path: '/admin/member-entry' },
  ]},
  
  { id: 'foods', label: 'Foods', icon: UtensilsCrossed, path: '/admin/food-pos', requiredRoles: ['super_admin', 'admin', 'manager', 'staff'], children: [
    { id: 'food-pos', label: 'POS', icon: Monitor, path: '/admin/food-pos' },
    { id: 'food-orders', label: 'Orders', icon: Receipt, path: '/admin/food-orders' },
    { id: 'food-items', label: 'Items', icon: List, path: '/admin/food' },
  ]},
  { id: 'expenses', label: 'Expenses', icon: Receipt, path: '/admin/expenses', requiredRoles: ['super_admin', 'admin', 'manager'] },
  { id: 'employees', label: 'Employees', icon: Users, path: '/admin/employees', requiredRoles: ['super_admin', 'admin'] },
  { id: 'roster', label: 'Roster', icon: Clock, path: '/admin/roster', requiredRoles: ['super_admin', 'admin', 'manager'] },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays, path: '/admin/bookings', requiredRoles: ['super_admin', 'admin', 'manager', 'staff'] },
  { id: 'events', label: 'Events', icon: PartyPopper, path: '/admin/events', requiredRoles: ['super_admin', 'admin', 'manager'] },
  
  { id: 'ride-reviews', label: 'Ride Reviews', icon: Star, path: '/admin/ride-reviews', requiredRoles: ['super_admin', 'admin', 'manager'] },
  { id: 'reports', label: 'Reports', icon: FileBarChart, path: '/admin/reports', requiredRoles: ['super_admin', 'admin', 'manager'] },
  { id: 'profit', label: 'Profit & Loss', icon: TrendingUp, path: '/admin/profit', requiredRoles: ['super_admin', 'admin', 'manager'] },
  { id: 'notifications', label: 'Notifications', icon: MessageSquare, path: '/admin/notifications', requiredRoles: ['super_admin', 'admin', 'manager'] },
  { id: 'homepage', label: 'Homepage', icon: Home, path: '/admin/homepage', requiredRoles: ['super_admin', 'admin'] },
  { id: 'users', label: 'Users', icon: Shield, path: '/admin/users', requiredRoles: ['super_admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings', requiredRoles: ['super_admin', 'admin'] },
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
  const { roles, isAdmin, isSuperAdmin, loading: rolesLoading } = useUserRoles();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Filter menu items based on user roles
  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => {
      if (!item.requiredRoles || item.requiredRoles.length === 0) {
        return true;
      }
      if (isSuperAdmin) {
        return true;
      }
      return item.requiredRoles.some(role => roles.includes(role));
    });
  }, [roles, isSuperAdmin]);

  // Auto-open group containing active child route
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.children?.some(c => location.pathname === c.path)) {
        setOpenGroups(prev => ({ ...prev, [item.id]: true }));
      }
    });
  }, [location.pathname, menuItems]);

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
          
          if (item.children && item.children.length > 0 && !collapsed) {
            const childActive = item.children.some(c => location.pathname === c.path);
            return (
              <Collapsible
                key={item.id}
                open={openGroups[item.id] ?? childActive}
                onOpenChange={(open) => setOpenGroups(prev => ({ ...prev, [item.id]: open }))}
              >
                <CollapsibleTrigger className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  childActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}>
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const childItemActive = location.pathname === child.path;
                    return (
                      <button
                        key={child.id}
                        onClick={() => handleNavigate(child.path)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          childItemActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <ChildIcon className="h-4 w-4 shrink-0" />
                        <span>{child.label}</span>
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

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
              title={collapsed ? (item.label) : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span>{item.label}</span>
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
          {!collapsed && <span className="ml-2">{'Logout'}</span>}
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar({ collapsed, onCollapse, onSignOut, userEmail }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <span className="font-bold text-sm">{'Admin'}</span>
        </div>
      </div>
    </>
  );
}
