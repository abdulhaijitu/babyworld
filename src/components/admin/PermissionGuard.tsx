import { ReactNode } from 'react';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useUserRoles } from '@/hooks/useUserRoles';
import { ShieldX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PermissionGuardProps {
  module: string;
  children: ReactNode;
  /** If true, only super_admin can access */
  superAdminOnly?: boolean;
}

export function PermissionGuard({ module, children, superAdminOnly = false }: PermissionGuardProps) {
  const { canViewModule, loading } = useRolePermissions();
  const { isSuperAdmin, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  if (loading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (superAdminOnly && !isSuperAdmin) {
    return <AccessDenied onGoBack={() => navigate('/admin')} />;
  }

  if (!canViewModule(module)) {
    return <AccessDenied onGoBack={() => navigate('/admin')} />;
  }

  return <>{children}</>;
}

function AccessDenied({ onGoBack }: { onGoBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <ShieldX className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">অ্যাক্সেস অনুমোদিত নয়</h2>
      <p className="text-muted-foreground max-w-md">
        এই পেজে আপনার অ্যাক্সেস নেই। আপনার অ্যাডমিনের সাথে যোগাযোগ করুন।
      </p>
      <Button onClick={onGoBack} variant="outline">
        ড্যাশবোর্ডে ফিরে যান
      </Button>
    </div>
  );
}
