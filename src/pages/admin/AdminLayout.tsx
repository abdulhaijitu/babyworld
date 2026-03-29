import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDashboardSkeleton } from '@/components/admin/AdminSkeleton';
import { AdminErrorState } from '@/components/admin/AdminErrorState';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { AdminMobileBottomNav } from '@/components/admin/AdminMobileBottomNav';
import { Menu, ExternalLink, Plus, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import babyWorldLogo from '@/assets/baby-world-logo.png';

const routeTitleMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/create-ticket': 'Create Ticket',
  '/admin/ticket-list': 'Ticket List',
  '/admin/gate-logs': 'Gate Logs',
  '/admin/food': 'Food Sales',
  '/admin/food-orders': 'Food Orders',
  '/admin/food-pos': 'Food POS',
  '/admin/coupons': 'Coupons',
  '/admin/employees': 'Employees',
  '/admin/roster': 'Roster',
  '/admin/attendance': 'Attendance',
  '/admin/leaves': 'Leave Management',
  '/admin/payroll': 'Payroll',
  '/admin/performance': 'Performance',
  '/admin/bookings': 'Bookings',
  '/admin/events': 'Events',
  '/admin/event-packages': 'Event Packages',
  '/admin/event-calendar': 'Event Calendar',
  '/admin/leads': 'Leads',
  '/admin/promotions': 'Promotions',
  '/admin/sms-campaigns': 'SMS Campaigns',
  '/admin/social-media': 'Social Media',
  '/admin/reports': 'Reports',
  '/admin/profit': 'Profit Reports',
  '/admin/expenses': 'Expenses',
  '/admin/expense-categories': 'Expense Categories',
  '/admin/income': 'Income',
  '/admin/income-categories': 'Income Categories',
  '/admin/daily-cash': 'Daily Cash Summary',
  '/admin/rides': 'Rides',
  '/admin/notifications': 'Notifications',
  '/admin/homepage': 'Homepage',
  '/admin/hero-slides': 'Hero Slides',
  '/admin/hero-cards': 'Hero Cards',
  '/admin/about-contact': 'About & Contact',
  '/admin/seo-branding': 'SEO & Branding',
  '/admin/memberships': 'Memberships',
  '/admin/membership-packages': 'Membership Packages',
  '/admin/member-entry': 'Member Entry',
  '/admin/users': 'Users',
  '/admin/roles': 'Roles',
  '/admin/settings': 'Settings',
  '/admin/settings/general': 'Settings',
  '/admin/settings/business': 'Settings',
  '/admin/settings/pricing': 'Settings',
  '/admin/settings/payment': 'Settings',
  '/admin/settings/notifications': 'Settings',
  '/admin/settings/email': 'Settings',
  '/admin/settings/sms': 'Settings',
};

const routeSectionMap: Record<string, string> = {
  '/admin': '',
  '/admin/create-ticket': 'Ticketing',
  '/admin/ticket-list': 'Ticketing',
  '/admin/gate-logs': 'Ticketing',
  '/admin/food': 'Food & Beverage',
  '/admin/food-orders': 'Food & Beverage',
  '/admin/food-pos': 'Food & Beverage',
  '/admin/coupons': 'Food & Beverage',
  '/admin/employees': 'Human Resources',
  '/admin/roster': 'Human Resources',
  '/admin/attendance': 'Human Resources',
  '/admin/leaves': 'Human Resources',
  '/admin/payroll': 'Human Resources',
  '/admin/performance': 'Human Resources',
  '/admin/bookings': 'Bookings & Events',
  '/admin/events': 'Bookings & Events',
  '/admin/event-packages': 'Bookings & Events',
  '/admin/event-calendar': 'Bookings & Events',
  '/admin/leads': 'Marketing',
  '/admin/promotions': 'Marketing',
  '/admin/sms-campaigns': 'Marketing',
  '/admin/social-media': 'Marketing',
  '/admin/reports': 'Finance',
  '/admin/profit': 'Finance',
  '/admin/expenses': 'Finance',
  '/admin/expense-categories': 'Finance',
  '/admin/income': 'Finance',
  '/admin/income-categories': 'Finance',
  '/admin/daily-cash': 'Finance',
  '/admin/rides': 'Rides',
  '/admin/notifications': 'Notifications',
  '/admin/homepage': 'Website',
  '/admin/hero-slides': 'Website',
  '/admin/hero-cards': 'Website',
  '/admin/about-contact': 'Website',
  '/admin/seo-branding': 'Website',
  '/admin/memberships': 'Memberships',
  '/admin/membership-packages': 'Memberships',
  '/admin/member-entry': 'Memberships',
  '/admin/users': 'User Management',
  '/admin/roles': 'User Management',
  '/admin/settings': 'Settings',
  '/admin/settings/general': 'Settings',
  '/admin/settings/business': 'Settings',
  '/admin/settings/pricing': 'Settings',
  '/admin/settings/payment': 'Settings',
  '/admin/settings/notifications': 'Settings',
  '/admin/settings/email': 'Settings',
  '/admin/settings/sms': 'Settings',
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, loading, initialized, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = useMemo(() => {
    return routeTitleMap[location.pathname] || 'Admin';
  }, [location.pathname]);

  const parentSection = useMemo(() => {
    return routeSectionMap[location.pathname] || '';
  }, [location.pathname]);

  useEffect(() => {
    if (initialized && !user) {
      navigate('/admin/login', { replace: true });
    }
  }, [initialized, user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  if (loading || !initialized) {
    return <AdminDashboardSkeleton />;
  }

  if (user && !isAdmin) {
    return <AdminErrorState type="permission" />;
  }

  if (!user) {
    return <AdminErrorState type="auth" />;
  }

  return (
    <div className="flex min-h-screen bg-background w-full overflow-x-hidden">
      <AdminSidebar 
        collapsed={collapsed}
        onCollapse={setCollapsed}
        onSignOut={handleSignOut}
        userEmail={user.email}
        mobileOpen={mobileMenuOpen}
        onMobileOpenChange={setMobileMenuOpen}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen min-w-0 overflow-x-hidden",
        "md:pt-0 pt-0",
        "pb-20 md:pb-0"
      )}>
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 px-3 md:px-6 h-12 md:h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
          {/* Left: Mobile menu + logo OR Desktop breadcrumb + title */}
          <div className="flex items-center gap-2">
            {/* Mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <img src={babyWorldLogo} alt="Baby World" className="md:hidden h-7 w-auto cursor-pointer" onClick={() => navigate('/admin')} />

            {/* Desktop breadcrumb + title */}
            <div className="hidden md:flex flex-col justify-center">
              <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                <span>Admin</span>
                {parentSection && (
                  <>
                    <span className="text-primary">/</span>
                    <span>{parentSection}</span>
                  </>
                )}
              </div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">{pageTitle}</h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Mobile title */}
            <h1 className="md:hidden text-[13px] font-semibold truncate max-w-[180px]">{pageTitle}</h1>

            {/* Desktop quick actions */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => window.open('/', '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Visit Website
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => navigate('/admin/create-ticket')}
              >
                <Plus className="h-3.5 w-3.5" />
                Create Ticket
              </Button>
            </div>
            <NotificationBell />
          </div>
        </div>
        <div className="p-3 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      <AdminMobileBottomNav onMenuClick={() => setMobileMenuOpen(true)} />
    </div>
  );
}