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
    .upsert({
      email: payload.email,
      full_name: payload.full_name,
      age: payload.age,
      photo_url: payload.photo_url,
      status: 'pending',
    }, { onConflict: 'email' })
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

export async function cancelPendingUstadRequest(email: string) {
  const { error } = await supabase
    .from('ustad_profiles')
    .delete()
    .eq('email', email)
    .eq('status', 'pending');

  if (error) {
    console.error('Cancel ustad request error:', error);
    return { data: null, error };
  }

  return { data: true, error: null };
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

export function clearStoredUstadEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const email = localStorage.getItem(USTAD_EMAIL_KEY);
    localStorage.removeItem(USTAD_EMAIL_KEY);
    return email;
  } catch {
    return null;
  }
}

export interface QuizQuestion {
  id: string;
  class_level: number;
  set_id: string;
  question_text: string;
  malayalam_text: string;
  english_transliteration: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  deletion_reason: string | null;
}

export type QuizQuestionCreate = Pick<
  QuizQuestion,
  | 'class_level'
  | 'set_id'
  | 'question_text'
  | 'malayalam_text'
  | 'english_transliteration'
  | 'option_a'
  | 'option_b'
  | 'option_c'
  | 'option_d'
  | 'correct_option'
> & {
  created_by?: string;
};

export type QuizQuestionUpdate = Partial<QuizQuestion>;

export async function getQuizQuestions(classLevel?: number, setId?: string) {
  let query = supabase
    .from('quiz_questions')
    .select('*')
    .eq('is_deleted', false)
    .order('set_id', { ascending: true })
    .order('created_at', { ascending: true });

  if (classLevel) query = query.eq('class_level', classLevel);
  if (setId) query = query.eq('set_id', setId);

  const { data, error } = await query;
  if (error) {
    console.error('Get quiz questions error:', error);
    return { data: [] as QuizQuestion[], error };
  }
  return { data: (data ?? []) as QuizQuestion[], error: null };
}

export async function createQuizQuestion(payload: QuizQuestionCreate) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Create quiz question error:', error);
    return { data: null as QuizQuestion | null, error };
  }
  return { data: data as QuizQuestion, error: null };
}

export async function updateQuizQuestion(id: string, payload: QuizQuestionUpdate) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Update quiz question error:', error);
    return { data: null as QuizQuestion | null, error };
  }
  return { data: null, error: null };
}

export async function deleteQuizQuestion(id: string, deletionReason: string, deletedBy?: string) {
  const payload: Pick<QuizQuestion, 'is_deleted' | 'deleted_at' | 'deletion_reason'> & { deleted_by?: string } = {
    is_deleted: true,
    deleted_at: new Date().toISOString(),
    deletion_reason: deletionReason,
  };

  if (deletedBy) payload.deleted_by = deletedBy;

  const { data, error } = await supabase
    .from('quiz_questions')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Delete quiz question error:', error);
    return { data: null, error };
  }
  return { data, error: null };
}
