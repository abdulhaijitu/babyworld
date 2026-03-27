import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Ticket, UtensilsCrossed, Users, CalendarDays,
  PartyPopper, Settings, ChevronLeft, ChevronRight, ChevronDown,
  Menu, LogOut, LogIn, Clock, FileBarChart, Shield, Video, Crown,
  Receipt, TrendingUp, FerrisWheel, MessageSquare, Home, Monitor,
  Plus, List, Megaphone, UserPlus, Tag, Share2, Briefcase,
  ClipboardCheck, CalendarOff, Wallet, Award, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useMemo, useEffect } from 'react';
import { useUserRoles, type AppRole } from '@/hooks/useUserRoles';
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarBadges } from '@/hooks/useSidebarBadges';
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
    { id: 'coupons', label: 'Coupons', icon: Crown, path: '/admin/coupons' },
  ]},
  { id: 'events-group', label: 'Events', icon: PartyPopper, path: '/admin/event-packages', requiredRoles: ['super_admin', 'admin', 'manager'], children: [
    { id: 'event-packages', label: 'Event Packages', icon: Crown, path: '/admin/event-packages' },
    { id: 'events', label: 'Bookings', icon: PartyPopper, path: '/admin/events' },
    { id: 'event-calendar', label: 'Event Calendar', icon: CalendarDays, path: '/admin/event-calendar' },
  ]},
  { id: 'marketing', label: 'Marketing', icon: Megaphone, path: '/admin/leads', requiredRoles: ['super_admin', 'admin', 'manager'], children: [
    { id: 'leads', label: 'Leads', icon: UserPlus, path: '/admin/leads' },
    { id: 'promotions', label: 'Promotions', icon: Tag, path: '/admin/promotions' },
    { id: 'sms-campaigns', label: 'SMS Campaigns', icon: MessageSquare, path: '/admin/sms-campaigns' },
    { id: 'social-media', label: 'Social Media', icon: Share2, path: '/admin/social-media' },
  ]},
  { id: 'hr', label: 'Human Resources', icon: Briefcase, path: '/admin/employees', requiredRoles: ['super_admin', 'admin', 'manager'], children: [
    { id: 'employees', label: 'Employees', icon: Users, path: '/admin/employees' },
    { id: 'roster', label: 'Roster', icon: Clock, path: '/admin/roster' },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, path: '/admin/attendance' },
    { id: 'leaves', label: 'Leave Management', icon: CalendarOff, path: '/admin/leaves' },
    { id: 'payroll', label: 'Payroll', icon: Wallet, path: '/admin/payroll' },
    { id: 'performance', label: 'Performance', icon: Award, path: '/admin/performance' },
  ]},
  { id: 'accounts', label: 'Accounts', icon: Wallet, path: '/admin/daily-cash', requiredRoles: ['super_admin', 'admin', 'manager'], children: [
    { id: 'daily-cash', label: 'Daily Cash Summary', icon: Briefcase, path: '/admin/daily-cash' },
    { id: 'income', label: 'Income', icon: TrendingUp, path: '/admin/income' },
    { id: 'income-categories', label: 'Income Categories', icon: Tag, path: '/admin/income-categories' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, path: '/admin/expenses' },
    { id: 'expense-categories', label: 'Expense Categories', icon: Tag, path: '/admin/expense-categories' },
    { id: 'profit', label: 'Profit & Loss', icon: TrendingUp, path: '/admin/profit' },
    { id: 'reports', label: 'Reports', icon: FileBarChart, path: '/admin/reports' },
  ]},
  { id: 'notifications', label: 'Notifications', icon: MessageSquare, path: '/admin/notifications', requiredRoles: ['super_admin', 'admin', 'manager'] },
  { id: 'frontend', label: 'Frontend', icon: Monitor, path: '/admin/homepage', requiredRoles: ['super_admin', 'admin'], children: [
    { id: 'homepage', label: 'Homepage', icon: Home, path: '/admin/homepage' },
    { id: 'about-contact', label: 'About & Contact', icon: Users, path: '/admin/about-contact' },
    { id: 'seo-branding', label: 'SEO & Branding', icon: FileBarChart, path: '/admin/seo-branding' },
  ]},
  { id: 'users', label: 'Users', icon: Shield, path: '/admin/users', requiredRoles: ['super_admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings', requiredRoles: ['super_admin', 'admin'] },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onSignOut: () => void;
  userEmail?: string;
}

function getInitials(email?: string) {
  if (!email) return '?';
  const name = email.split('@')[0];
  return name.substring(0, 2).toUpperCase();
}

function BadgePill({ count, collapsed }: { count: number; collapsed: boolean }) {
  if (count <= 0) return null;

  if (collapsed) {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card"
      >
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-40" />
      </motion.span>
    );
  }

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none"
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
}

function getItemBadgeCount(itemId: string, badges: Record<string, number>): number {
  return badges[itemId as keyof typeof badges] ?? 0;
}

function getGroupBadgeCount(item: MenuItem, badges: Record<string, number>): number {
  if (!item.children) return getItemBadgeCount(item.id, badges);
  return item.children.reduce((sum, child) => sum + getItemBadgeCount(child.id, badges), 0);
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
  const { roles, isSuperAdmin } = useUserRoles();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const badges = useSidebarBadges();

  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => {
      if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
      if (isSuperAdmin) return true;
      return item.requiredRoles.some(role => roles.includes(role));
    });
  }, [roles, isSuperAdmin]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const q = searchQuery.toLowerCase();
    return menuItems.filter(item => {
      if (item.label.toLowerCase().includes(q)) return true;
      if (item.children?.some(c => c.label.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [menuItems, searchQuery]);

  useEffect(() => {
    menuItems.forEach(item => {
      if (item.children?.some(c => location.pathname === c.path)) {
        setOpenGroups({ [item.id]: true });
      }
    });
  }, [location.pathname, menuItems]);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile && onMobileClose) onMobileClose();
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-card border-r border-border"
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center h-12 px-2 border-b border-border",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <img src={babyWorldLogo} alt="Baby World" className="h-5 w-auto" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-foreground leading-tight">Baby World</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Admin Dashboard</span>
            </div>
          </motion.div>
        ) : (
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <img src={babyWorldLogo} alt="Baby World" className="h-5 w-auto" />
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapse(!collapsed)}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hidden md:flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Search */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-2 pt-2 pb-0.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-7 pl-7 pr-3 rounded-md border border-border bg-muted/50 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Items */}
      <nav className="flex-1 py-1.5 px-1.5 space-y-0.5 overflow-y-auto">
        {filteredItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const groupBadge = getGroupBadgeCount(item, badges);

          if (item.children && item.children.length > 0 && !collapsed) {
            const childActive = item.children.some(c => location.pathname === c.path);
            const filteredChildren = searchQuery.trim()
              ? item.children.filter(c => c.label.toLowerCase().includes(searchQuery.toLowerCase()))
              : item.children;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Collapsible
                  open={item.id in openGroups ? openGroups[item.id] : (childActive || !!searchQuery.trim())}
                  onOpenChange={(open) => setOpenGroups(open ? { [item.id]: true } : { [item.id]: false })}
                >
                  <CollapsibleTrigger className={cn(
                    "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                    childActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}>
                    <motion.div
                      className={cn(
                        "h-6 w-6 rounded-md flex items-center justify-center shrink-0 transition-colors duration-200",
                        childActive ? "bg-primary/15" : "bg-transparent"
                      )}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </motion.div>
                    <span className="flex-1 text-left">{item.label}</span>
                    <AnimatePresence>
                      {groupBadge > 0 && (
                        <BadgePill count={groupBadge} collapsed={false} />
                      )}
                    </AnimatePresence>
                    <ChevronDown className={cn(
                      "h-3 w-3 shrink-0 transition-transform duration-200",
                      (openGroups[item.id] ?? childActive) ? "rotate-180" : ""
                    )} />
                  </CollapsibleTrigger>
                  <AnimatePresence initial={false}>
                    {(openGroups[item.id] ?? childActive ?? !!searchQuery.trim()) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 mt-0.5 space-y-0.5">
                          {filteredChildren.map((child) => {
                            const ChildIcon = child.icon;
                            const childItemActive = location.pathname === child.path;
                            const childBadge = getItemBadgeCount(child.id, badges);
                            return (
                              <button
                                key={child.id}
                                onClick={() => handleNavigate(child.path)}
                                className={cn(
                                  "w-full flex items-center gap-2 px-2.5 py-1 rounded-md text-xs transition-all duration-200 relative",
                                  childItemActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                              >
                                {childItemActive && (
                                  <motion.div
                                    layoutId="sidebar-active-indicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary"
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                  />
                                )}
                                <ChildIcon className="h-3 w-3 shrink-0" />
                                <span>{child.label}</span>
                                <AnimatePresence>
                                  {childBadge > 0 && (
                                    <BadgePill count={childBadge} collapsed={false} />
                                  )}
                                </AnimatePresence>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Collapsible>
              </motion.div>
            );
          }

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 group relative",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-1.5"
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && !collapsed && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <motion.div
                className={cn(
                  "h-6 w-6 rounded-md flex items-center justify-center shrink-0 transition-colors duration-200 relative",
                  active ? "bg-primary/15" : "bg-transparent"
                )}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Icon className="h-3.5 w-3.5" />
                {collapsed && (
                  <AnimatePresence>
                    {groupBadge > 0 && (
                      <BadgePill count={groupBadge} collapsed={true} />
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && (
                <AnimatePresence>
                  {groupBadge > 0 && (
                    <BadgePill count={groupBadge} collapsed={false} />
                  )}
                </AnimatePresence>
              )}
              {/* Collapsed tooltip */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs font-medium rounded-md shadow-md border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                  {groupBadge > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                      {groupBadge}
                    </span>
                  )}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-popover border-l border-b border-border rotate-45" />
                </div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom: Profile + Logout */}
      <div className={cn("border-t border-border p-1.5 space-y-1", collapsed && "flex flex-col items-center")}>
        {!collapsed ? (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50">
            <div className="h-7 w-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
              {getInitials(userEmail)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{userEmail?.split('@')[0]}</p>
              <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
        ) : (
          userEmail && (
            <div className="h-7 w-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold" title={userEmail}>
              {getInitials(userEmail)}
            </div>
          )
        )}

        <button
          onClick={onSignOut}
          className={cn(
            "w-full flex items-center gap-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative",
            "text-destructive hover:bg-destructive/10",
            collapsed ? "justify-center p-1.5" : "px-3 py-1.5"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-popover text-destructive text-xs font-medium rounded-md shadow-md border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
              Logout
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-popover border-l border-b border-border rotate-45" />
            </div>
          )}
        </button>
      </div>
    </motion.div>
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card/95 backdrop-blur-sm border-b border-border flex items-center px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
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
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <img src={babyWorldLogo} alt="Baby World" className="h-5 w-auto" />
          </div>
          <span className="font-semibold text-sm text-foreground">Admin</span>
        </div>
      </div>
    </>
  );
}
