import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRoles } from './useUserRoles';

interface RolePermission {
  role: string;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export function useRolePermissions() {
  const { user } = useAuth();
  const { roles, isSuperAdmin, isAdmin, loading: rolesLoading } = useUserRoles();
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user?.id || rolesLoading) return;

    // Super admin and admin bypass permission checks
    if (isSuperAdmin || isAdmin) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    if (roles.length === 0) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('role, module, can_view, can_create, can_edit, can_delete')
        .in('role', roles);

      if (error) {
        console.error('[RolePermissions] Error:', error);
      } else {
        setPermissions(data || []);
      }
    } catch (err) {
      console.error('[RolePermissions] Failed:', err);
    }
    setLoading(false);
  }, [user?.id, roles, isSuperAdmin, isAdmin, rolesLoading]);

  useEffect(() => {
    if (!rolesLoading) {
      fetchPermissions();
    }
  }, [rolesLoading, fetchPermissions]);

  // Check if user can view a specific module
  const canViewModule = useCallback((module: string): boolean => {
    if (isSuperAdmin || isAdmin) return true;
    return permissions.some(p => p.module === module && p.can_view);
  }, [permissions, isSuperAdmin, isAdmin]);

  const canCreateInModule = useCallback((module: string): boolean => {
    if (isSuperAdmin || isAdmin) return true;
    return permissions.some(p => p.module === module && p.can_create);
  }, [permissions, isSuperAdmin, isAdmin]);

  const canEditInModule = useCallback((module: string): boolean => {
    if (isSuperAdmin || isAdmin) return true;
    return permissions.some(p => p.module === module && p.can_edit);
  }, [permissions, isSuperAdmin, isAdmin]);

  const canDeleteInModule = useCallback((module: string): boolean => {
    if (isSuperAdmin || isAdmin) return true;
    return permissions.some(p => p.module === module && p.can_delete);
  }, [permissions, isSuperAdmin, isAdmin]);

  // Get all viewable module names
  const viewableModules = useMemo(() => {
    if (isSuperAdmin || isAdmin) return null; // null means all modules
    return new Set(permissions.filter(p => p.can_view).map(p => p.module));
  }, [permissions, isSuperAdmin, isAdmin]);

  return {
    permissions,
    loading: loading || rolesLoading,
    canViewModule,
    canCreateInModule,
    canEditInModule,
    canDeleteInModule,
    viewableModules,
    refetch: fetchPermissions,
  };
}
