import { useState, useEffect, useCallback } from 'react';
import { supabase, signInWithGoogle, signOut, onAuthStateChange } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const fetchRole = async (userId: string | undefined) => {
      if (!userId) {
        setRole(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) {
        setRole(null);
        return;
      }

      setRole(data.role);
    };

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await fetchRole(currentUser?.id);
      setLoading(false);
      setInitialized(true);
    };

    getInitialSession();

    const { data: { subscription: sub } } = onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await fetchRole(currentUser?.id);
      setLoading(false);
    });

    subscription = sub;

    return () => {
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
