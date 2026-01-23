import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDashboardSkeleton } from '@/components/admin/AdminSkeleton';
import { AdminErrorState } from '@/components/admin/AdminErrorState';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
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
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen",
        "md:pt-0 pt-14" // Mobile header offset
      )}>
        <Outlet />
      </main>
    </div>
  );
}
