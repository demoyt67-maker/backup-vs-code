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

const USTAD_BUCKET = 'ustad-photos';

export async function getUstadProfileByEmail(email: string) {
  const { data, error } = await supabase
    .from('ustad_profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Get ustad profile error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createUstadProfile(payload: { email: string; full_name: string; age: number; photo_url: string | null }) {
  const { data, error } = await supabase
    .from('ustad_profiles')
    .insert({
      email: payload.email,
      full_name: payload.full_name,
      age: payload.age,
      photo_url: payload.photo_url,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Create ustad profile error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function uploadUstadPhoto(email: string, file: File): Promise<string> {
  const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
  const fileExt = file.name.split('.').pop();
  const fileName = `${safeEmail}-${Date.now()}.${fileExt}`;
  const filePath = `ustad/${safeEmail}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(USTAD_BUCKET)
    .upload(filePath, file, { upsert: true, cacheControl: '3600' });

  if (uploadError) {
    console.error('Upload ustad photo error:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from(USTAD_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function updateUstadProfileStatus(id: string, status: 'approved' | 'rejected', rejectionReason?: string) {
  const payload: Record<string, unknown> = { status };
  if (status === 'rejected' && rejectionReason !== undefined) {
    payload.rejection_reason = rejectionReason;
  }

  const { data, error } = await supabase
    .from('ustad_profiles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update ustad profile status error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

const USTAD_EMAIL_KEY = 'madrasa-ustad-email';

export function getStoredUstadEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(USTAD_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function setStoredUstadEmail(email: string) {
  try {
    localStorage.setItem(USTAD_EMAIL_KEY, email);
  } catch {
    // ignore
  }
}

export function clearStoredUstadEmail() {
  try {
    localStorage.removeItem(USTAD_EMAIL_KEY);
  } catch {
    // ignore
  }
}
