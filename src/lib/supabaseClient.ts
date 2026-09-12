import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('[Supabase] Env URL present:', !!supabaseUrl, 'Key present:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = init?.method || 'GET';
  console.log('[Supabase] Fetch start:', method, url);
  const start = performance.now();
  try {
    const response = await originalFetch(input, init);
    const duration = performance.now() - start;
    console.log('[Supabase] Fetch complete:', response.status, response.statusText, `(${duration.toFixed(0)}ms)`);
    return response;
  } catch (error) {
    const duration = performance.now() - start;
    console.log('[Supabase] Fetch error:', error, `(${duration.toFixed(0)}ms)`);
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    console.error('Sign in error:', error);
    return { error };
  }
  
  return { data };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Sign out error:', error);
    return { error };
  }
  
  return { success: true };
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
