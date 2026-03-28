import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDashboardSkeleton } from '@/components/admin/AdminSkeleton';
import { AdminErrorState } from '@/components/admin/AdminErrorState';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { AdminMobileBottomNav } from '@/components/admin/AdminMobileBottomNav';
import { Menu } from 'lucide-react';
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

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, loading, initialized, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = useMemo(() => {
    return routeTitleMap[location.pathname] || 'Admin';
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
    <div className="flex min-h-screen bg-background w-full">
      <AdminSidebar 
        collapsed={collapsed}
        onCollapse={setCollapsed}
        onSignOut={handleSignOut}
        userEmail={user.email}
        mobileOpen={mobileMenuOpen}
        onMobileOpenChange={setMobileMenuOpen}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen",
        "md:pt-0 pt-0",
        "pb-20 md:pb-0"
      )}>
        {/* Top bar with page title and notifications */}
        <div className="flex items-center justify-between gap-2 px-3 md:px-6 h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <img src={babyWorldLogo} alt="Baby World" className="md:hidden h-7 w-auto cursor-pointer" onClick={() => navigate('/admin')} />
            <h1 className="text-sm md:text-base font-semibold truncate">{pageTitle}</h1>
          </div>
          <NotificationBell />
        </div>
        <div className="p-3 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      <AdminMobileBottomNav onMenuClick={() => setMobileMenuOpen(true)} />
    </div>
  );
}