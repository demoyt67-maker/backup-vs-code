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

export function useUstadAuth(emailOverride?: string) {
  const [profile, setProfile] = useState<UstadProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const email = emailOverride;
    console.log('[USTAD DEBUG] refetch email:', email);
    if (!email) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const currentFetchId = ++fetchIdRef.current;
    setLoading(true);
    const { data } = await getUstadProfileByEmail(email);
    console.log('[USTAD DEBUG] refetch profile:', data);
    if (fetchIdRef.current === currentFetchId) {
      setProfile(data);
      setLoading(false);
    }
  }, [emailOverride]);

  useEffect(() => {
    let cancelled = false;
    const fetchId = ++fetchIdRef.current;

    const fetchProfile = async () => {
      const email = emailOverride;
      console.log('[USTAD DEBUG] init email:', email);
      if (!email) {
        if (!cancelled && fetchIdRef.current === fetchId) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data } = await getUstadProfileByEmail(email);
      console.log('[USTAD DEBUG] init profile:', data);
      if (!cancelled && fetchIdRef.current === fetchId) {
        setProfile(data);
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [emailOverride]);

  const status: UstadStatus = profile?.status === 'approved' ? 'approved' : profile?.status === 'pending' ? 'pending' : profile?.status === 'rejected' ? 'rejected' : null;

  return { profile, status, loading, refetch };
}
