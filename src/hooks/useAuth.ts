import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  error: string | null;
}

const INITIAL_STATE: AuthState = {
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  error: null
};

// Timeout for auth operations (10 seconds)
const AUTH_TIMEOUT = 10000;

export function useAuth() {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Safe state update that checks if component is still mounted
  const safeSetState = useCallback((updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Check admin role with error handling
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
    mountedRef.current = true;

    // Set a timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current && state.loading) {
        console.warn('[Auth] Auth check timed out');
        safeSetState({ 
          loading: false, 
          error: 'Authentication timed out. Please refresh the page.' 
        });
      }
    }, AUTH_TIMEOUT);

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State change:', event);
        
        if (session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          safeSetState({
            session,
            user: session.user,
            isAdmin,
            loading: false,
            error: null
          });
        } else {
          safeSetState({
            session: null,
            user: null,
            isAdmin: false,
            loading: false,
            error: null
          });
        }
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Error getting session:', error.message);
          safeSetState({ loading: false, error: error.message });
          return;
        }

        if (session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          safeSetState({
            session,
            user: session.user,
            isAdmin,
            loading: false,
            error: null
          });
        } else {
          safeSetState({ loading: false });
        }
      } catch (err) {
        console.error('[Auth] Failed to initialize:', err);
        safeSetState({ 
          loading: false, 
          error: 'Failed to initialize authentication' 
        });
      }
    };

    initializeAuth();

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, [checkAdminRole, safeSetState]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (err) {
      console.error('[Auth] Sign in error:', err);
      return { error: { message: 'Sign in failed' } as any };
    }
  }, []);

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
      return { error: { message: 'Sign up failed' } as any };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      console.error('[Auth] Sign out error:', err);
      return { error: { message: 'Sign out failed' } as any };
    }
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut
  };
}
