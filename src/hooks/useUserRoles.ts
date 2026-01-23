import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'manager' | 'staff' | 'user';

interface UserRoleState {
  roles: AppRole[];
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  loading: boolean;
}

export function useUserRoles() {
  const { user, initialized } = useAuth();
  const [state, setState] = useState<UserRoleState>({
    roles: [],
    isAdmin: false,
    isManager: false,
    isStaff: false,
    loading: true,
  });

  const fetchRoles = useCallback(async () => {
    if (!user?.id) {
      setState({
        roles: [],
        isAdmin: false,
        isManager: false,
        isStaff: false,
        loading: false,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('[UserRoles] Error fetching roles:', error);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const roles = (data?.map(r => r.role) || []) as AppRole[];
      setState({
        roles,
        isAdmin: roles.includes('admin'),
        isManager: roles.includes('manager') || roles.includes('admin'),
        isStaff: roles.includes('staff') || roles.includes('manager') || roles.includes('admin'),
        loading: false,
      });
    } catch (err) {
      console.error('[UserRoles] Failed to fetch roles:', err);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user?.id]);

  useEffect(() => {
    if (initialized) {
      fetchRoles();
    }
  }, [initialized, fetchRoles]);

  // Check if user has a specific role
  const hasRole = useCallback((role: AppRole): boolean => {
    return state.roles.includes(role);
  }, [state.roles]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: AppRole[]): boolean => {
    return roles.some(role => state.roles.includes(role));
  }, [state.roles]);

  // Permission helpers
  const canAccessReports = useMemo(() => 
    state.isAdmin || state.isManager, 
    [state.isAdmin, state.isManager]
  );

  const canManageEmployees = useMemo(() => 
    state.isAdmin, 
    [state.isAdmin]
  );

  const canManageSettings = useMemo(() => 
    state.isAdmin, 
    [state.isAdmin]
  );

  const canManageUsers = useMemo(() => 
    state.isAdmin, 
    [state.isAdmin]
  );

  const canAccessTicketing = useMemo(() => 
    state.isStaff, 
    [state.isStaff]
  );

  const canAccessFood = useMemo(() => 
    state.isStaff, 
    [state.isStaff]
  );

  const canAccessBookings = useMemo(() => 
    state.isStaff, 
    [state.isStaff]
  );

  return {
    ...state,
    hasRole,
    hasAnyRole,
    canAccessReports,
    canManageEmployees,
    canManageSettings,
    canManageUsers,
    canAccessTicketing,
    canAccessFood,
    canAccessBookings,
    refetch: fetchRoles,
  };
}
