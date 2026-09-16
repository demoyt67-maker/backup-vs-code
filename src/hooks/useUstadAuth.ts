import { useState, useEffect, useCallback, useRef } from 'react';
import { getUstadProfileByEmail, getStoredUstadEmail, setStoredUstadEmail, clearStoredUstadEmail } from '@/lib/supabaseClient';

export type UstadStatus = 'approved' | 'pending' | 'rejected' | null;

export interface UstadProfile {
  id: string;
  email: string;
  full_name: string;
  age: number;
  photo_url: string | null;
  status: string;
  rejection_reason: string | null;
}

export function useUstadAuth() {
  const [profile, setProfile] = useState<UstadProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const email = getStoredUstadEmail();
    if (!email) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const currentFetchId = ++fetchIdRef.current;
    setLoading(true);
    const { data } = await getUstadProfileByEmail(email);
    if (fetchIdRef.current === currentFetchId) {
      setProfile(data);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchId = ++fetchIdRef.current;

    const fetchProfile = async () => {
      const email = getStoredUstadEmail();
      if (!email) {
        if (!cancelled && fetchIdRef.current === fetchId) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data } = await getUstadProfileByEmail(email);
      if (!cancelled && fetchIdRef.current === fetchId) {
        setProfile(data);
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const status: UstadStatus = profile?.status === 'approved' ? 'approved' : profile?.status === 'pending' ? 'pending' : profile?.status === 'rejected' ? 'rejected' : null;

  return { profile, status, loading, refetch };
}
