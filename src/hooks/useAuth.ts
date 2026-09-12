import { useState, useEffect, useCallback } from 'react';
import { supabase, signInWithGoogle, signOut, onAuthStateChange } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

const AUTH_TIMEOUT_MS = 5000;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let mounted = true;
    let initCompleted = false;

    const finishInit = () => {
      if (mounted && !initCompleted) {
        initCompleted = true;
        setLoading(false);
        setInitialized(true);
      }
    };

    const fetchRole = async (userId: string | undefined) => {
      if (!userId) {
        setRole(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (error || !data) {
          setRole(null);
          return;
        }

        if (mounted) {
          setRole(data.role);
        }
      } catch {
        if (mounted) {
          setRole(null);
        }
      }
    };

    const init = async () => {
      const timeoutId = setTimeout(() => {
        if (mounted && !initCompleted) {
          console.warn('Auth initialization timed out');
          finishInit();
        }
      }, AUTH_TIMEOUT_MS);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;

        if (mounted) {
          setUser(currentUser);
          await fetchRole(currentUser?.id);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) {
          setUser(null);
          setRole(null);
        }
      } finally {
        clearTimeout(timeoutId);
        finishInit();
      }
    };

    init();

    const { data: { subscription: sub } } = onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;

      if (mounted) {
        setUser(currentUser);
        await fetchRole(currentUser?.id);
        finishInit();
      }
    });

    subscription = sub;

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = useCallback(async () => {
    return await signInWithGoogle();
  }, []);

  const logout = useCallback(async () => {
    return await signOut();
  }, []);

  const isAuthenticated = user !== null;
  const isSuperAdmin = role === 'super_admin';

  return {
    user,
    role,
    loading,
    initialized,
    isAuthenticated,
    isSuperAdmin,
    login,
    logout,
  };
}

// Export types for external use
export type { User };
