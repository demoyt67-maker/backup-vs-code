import { useState, useEffect, useCallback } from 'react';
import { supabase, signInWithGoogle, signOut, onAuthStateChange } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

const AUTH_INIT_TIMEOUT_MS = 8000;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('[useAuth] useEffect run');
    let subscription: { unsubscribe: () => void } | null = null;
    let mounted = true;
    let initCompleted = false;
    let roleFetchId = 0;

    const finishInit = () => {
      if (mounted && !initCompleted) {
        initCompleted = true;
        setLoading(false);
        setInitialized(true);
      }
    };

    const fetchRole = async (userId: string | undefined) => {
      const currentFetchId = ++roleFetchId;
      console.log('[useAuth] fetchRole start, userId=', userId, 'fetchId=', currentFetchId);

      if (!userId) {
        console.log('[useAuth] fetchRole aborted: no userId');
        setRole(null);
        return;
      }

      try {
        console.log('[useAuth] fetchRole querying profiles for userId=', userId);
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        console.log('[useAuth] fetchRole Supabase response data=', data, 'error=', error, 'fetchId=', currentFetchId);

        if (!mounted || roleFetchId !== currentFetchId) {
          console.log('[useAuth] fetchRole stale response ignored, fetchId=', currentFetchId);
          return;
        }

        if (error || !data) {
          console.log('[useAuth] fetchRole failed: error or no data');
          setRole(null);
          return;
        }

        const rawRole = data.role ?? null;
        const normalized = (rawRole ?? '').trim().toLowerCase();
        const isSuperAdmin = normalized === 'super_admin';
        console.log('[useAuth] fetchRole final rawRole=', rawRole, 'normalized=', normalized, 'isSuperAdmin=', isSuperAdmin);

        if (mounted) {
          setRole(rawRole);
        }
      } catch (err) {
        console.log('[useAuth] fetchRole exception:', err);
        if (mounted) {
          setRole(null);
        }
      }
    };

    const init = async () => {
      const timeoutId = setTimeout(() => {
        if (mounted && !initCompleted) {
          finishInit();
        }
      }, AUTH_INIT_TIMEOUT_MS);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        console.log('[useAuth] getSession result:', currentUser ? currentUser.email : 'null');

        if (mounted) {
          if (currentUser) {
            setUser(currentUser);
            await fetchRole(currentUser?.id);
            finishInit();
          } else {
            finishInit();
          }
        }
      } catch (error) {
        console.error('[useAuth] init error:', error);
        if (mounted) {
          setUser(null);
          setRole(null);
          finishInit();
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    init();

    const { data: { subscription: sub } } = onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      console.log('[useAuth] onAuthStateChange event:', event, 'user:', currentUser ? currentUser.email : 'null');

      if (mounted) {
        setUser(currentUser);
        if (currentUser) {
          fetchRole(currentUser?.id);
        } else {
          setRole(null);
        }
        finishInit();
      }
    });

    subscription = sub;

    return () => {
      console.log('[useAuth] cleanup');
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
  const isSuperAdmin = (role ?? '').trim().toLowerCase() === 'super_admin';

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
