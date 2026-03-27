import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDashboardSkeleton } from '@/components/admin/AdminSkeleton';
import { AdminErrorState } from '@/components/admin/AdminErrorState';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { AdminMobileBottomNav } from '@/components/admin/AdminMobileBottomNav';

import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, loading, initialized, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (initialized && !user) {
      navigate('/admin/login', { replace: true });
    }
  }, [initialized, user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  // Show skeleton while loading
  if (loading || !initialized) {
    return <AdminDashboardSkeleton />;
  }

  // Show permission error if not admin
  if (user && !isAdmin) {
    return <AdminErrorState type="permission" />;
  }

  // Show login required if no user
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
        "md:pt-0 pt-2",
        "pb-20 md:pb-0"
      )}>
        {/* Top bar with notifications */}
        <div className="hidden md:flex items-center justify-end gap-2 p-4 border-b">
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
