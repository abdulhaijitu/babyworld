import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  initialized: boolean;
}

const INITIAL_STATE: AuthState = {
  user: null,
  session: null,
  isAdmin: false,
  initialized: false
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  // Safe state update that checks if component is still mounted
  const safeSetState = useCallback((updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Check admin role with error handling - memoized to prevent recreation
  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('[Auth] Error checking admin role:', error.message);
        return false;
      }
      
      return roles?.some(r => r.role === 'admin') || false;
    } catch (err) {
      console.error('[Auth] Failed to check admin role:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    // Prevent double initialization
    if (initializingRef.current) return;
    initializingRef.current = true;
    mountedRef.current = true;

    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State change:', event);
        
        if (!mountedRef.current) return;

        if (session?.user) {
          // Use setTimeout to avoid blocking the auth state update
          // This prevents race conditions with Supabase's internal state
          setTimeout(async () => {
            if (!mountedRef.current) return;
            const isAdmin = await checkAdminRole(session.user.id);
            safeSetState({
              session,
              user: session.user,
              isAdmin,
              initialized: true
            });
          }, 0);
        } else {
          safeSetState({
            session: null,
            user: null,
            isAdmin: false,
            initialized: true
          });
        }
      }
    );

    // Then get initial session (non-blocking)
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Error getting session:', error.message);
          safeSetState({ initialized: true });
          return;
        }

        if (session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          safeSetState({
            session,
            user: session.user,
            isAdmin,
            initialized: true
          });
        } else {
          safeSetState({ initialized: true });
        }
      } catch (err) {
        console.error('[Auth] Failed to initialize:', err);
        safeSetState({ initialized: true });
      }
    };

    initializeAuth();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [checkAdminRole, safeSetState]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!error && data.session) {
        // Immediately update local state for faster UX
        const isAdmin = await checkAdminRole(data.session.user.id);
        safeSetState({
          session: data.session,
          user: data.session.user,
          isAdmin,
          initialized: true
        });
      }
      
      return { error };
    } catch (err) {
      console.error('[Auth] Sign in error:', err);
      return { error: { message: 'Sign in failed. Please try again.' } as any };
    }
  }, [checkAdminRole, safeSetState]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      return { error };
    } catch (err) {
      console.error('[Auth] Sign up error:', err);
      return { error: { message: 'Sign up failed. Please try again.' } as any };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        // Immediately clear local state
        safeSetState({
          session: null,
          user: null,
          isAdmin: false
        });
      }
      return { error };
    } catch (err) {
      console.error('[Auth] Sign out error:', err);
      return { error: { message: 'Sign out failed' } as any };
    }
  }, [safeSetState]);

  // Compute loading state - only true during initial load
  const loading = !state.initialized;

  return useMemo(() => ({
    user: state.user,
    session: state.session,
    loading,
    isAdmin: state.isAdmin,
    initialized: state.initialized,
    signIn,
    signUp,
    signOut
  }), [state.user, state.session, loading, state.isAdmin, state.initialized, signIn, signUp, signOut]);
}
