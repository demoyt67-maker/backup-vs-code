import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('[Supabase] Env URL present:', !!supabaseUrl, 'Key present:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

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
    const message = error.message && /duplicate key|already exists|unique/i.test(error.message)
      ? 'An account with this email already exists or is pending approval.'
      : error.message;
    return { data: null, error: { message } };
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
    return { data: true, error };
  }

  return { data: true, error: null };
}

export async function restoreQuizQuestion(id: string) {
  const { data, error } = await supabase.rpc(
    'restore_quiz_question',
    {
      p_id: id,
    }
  );

  if (error) {
    console.error('[QUIZ UNDO] error:', error);
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

export async function getQuizSetIds(classLevel: number) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('set_id')
    .eq('class_level', classLevel)
    .eq('is_deleted', false);

  if (error) {
    console.error('Get quiz set ids error:', error);
    return { data: [] as string[], error };
  }

  const unique = Array.from(new Set((data ?? []).map((r) => r.set_id)));
  return { data: unique, error: null };
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
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update quiz question error:', error);
    return { data: null as QuizQuestion | null, error };
  }
  return { data: data as QuizQuestion, error: null };
}

export async function deleteQuizQuestion(
  id: string,
  deletionReason: string
) {
  const { data, error } = await supabase.rpc(
    'soft_delete_quiz_question',
    {
      p_id: id,
      p_reason: deletionReason,
    }
  );

  if (error) {
    console.error('[QUIZ DELETE] error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export interface LearningContent {
  id: string;
  class_level: number;
  set_id: string;
  content_type: string;
  title: string;
  malayalam_content: string;
  english_content: string;
  arabic_content: string | null;
  image_url: string | null;
  audio_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  deletion_reason: string | null;
}

export type LearningContentCreate = Pick<
  LearningContent,
  | 'class_level'
  | 'set_id'
  | 'content_type'
  | 'title'
  | 'malayalam_content'
  | 'english_content'
> & {
  arabic_content?: string | null;
  image_url?: string | null;
  audio_url?: string | null;
  created_by?: string;
};

export type LearningContentUpdate = Partial<LearningContent>;

export const CONTENT_TYPE_OPTIONS = [
  { value: 'lesson', label: 'Lesson' },
  { value: 'explanation', label: 'Explanation' },
  { value: 'example', label: 'Example' },
  { value: 'practice', label: 'Practice' },
  { value: 'note', label: 'Note' },
] as const;

export async function getLearningContents(classLevel?: number, setId?: string) {
  let query = supabase
    .from('ustad_learning_content')
    .select('*')
    .eq('is_deleted', false)
    .order('class_level', { ascending: true })
    .order('set_id', { ascending: true })
    .order('created_at', { ascending: true });

  if (classLevel) query = query.eq('class_level', classLevel);
  if (setId) query = query.eq('set_id', setId);

  const { data, error } = await query;
  if (error) {
    console.error('Get learning contents error:', error);
    return { data: [] as LearningContent[], error };
  }
  return { data: (data ?? []) as LearningContent[], error: null };
}

export async function createLearningContent(payload: LearningContentCreate) {
  const { data, error } = await supabase
    .from('ustad_learning_content')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Create learning content error:', error);
    return { data: null as LearningContent | null, error };
  }
  return { data: data as LearningContent, error: null };
}

export async function updateLearningContent(id: string, payload: LearningContentUpdate) {
  const { data, error } = await supabase
    .from('ustad_learning_content')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update learning content error:', error);
    return { data: null as LearningContent | null, error };
  }
  return { data: data as LearningContent, error: null };
}

export async function deleteLearningContent(id: string, deletionReason: string) {
  const { data, error } = await supabase.rpc(
    'soft_delete_ustad_learning_content',
    {
      p_id: id,
      p_reason: deletionReason,
    }
  );

  if (error) {
    console.error('[CONTENT DELETE] error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function restoreLearningContent(id: string) {
  const { data, error } = await supabase.rpc(
    'restore_ustad_learning_content',
    {
      p_id: id,
    }
  );

  if (error) {
    console.error('[CONTENT RESTORE] error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export interface DailyIslamicLearning {
  id: string;
  content_type: 'ayah' | 'dua' | 'good_message';
  title: string;
  arabic_content: string | null;
  malayalam_content: string;
  english_content: string;
  scheduled_date: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export type DailyIslamicLearningCreate = Pick<
  DailyIslamicLearning,
  'content_type' | 'title' | 'malayalam_content' | 'english_content' | 'scheduled_date'
> & {
  arabic_content?: string | null;
  created_by?: string;
};

export type DailyIslamicLearningUpdate = Partial<DailyIslamicLearning>;

export const DAILY_ISLAMIC_CONTENT_TYPES = [
  { value: 'ayah', label: 'Ayah' },
  { value: 'dua', label: 'Dua' },
  { value: 'good_message', label: 'Good Message' },
] as const;

export async function getDailyIslamicLearning(status?: string) {
  let query = supabase
    .from('daily_islamic_learning')
    .select('*')
    .order('scheduled_date', { ascending: true })
    .order('created_at', { ascending: true });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    console.error('Get daily Islamic learning error:', error);
    return { data: [] as DailyIslamicLearning[], error };
  }
  return { data: (data ?? []) as DailyIslamicLearning[], error: null };
}

export async function getMyDailyIslamicLearning(createdBy: string) {
  const { data, error } = await supabase
    .from('daily_islamic_learning')
    .select('*')
    .eq('created_by', createdBy)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get my daily Islamic learning error:', error);
    return { data: [] as DailyIslamicLearning[], error };
  }
  return { data: (data ?? []) as DailyIslamicLearning[], error: null };
}

export async function createDailyIslamicLearning(payload: DailyIslamicLearningCreate) {
  const { data, error } = await supabase
    .from('daily_islamic_learning')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Create daily Islamic learning error:', error);
    return { data: null as DailyIslamicLearning | null, error };
  }
  return { data: data as DailyIslamicLearning, error: null };
}

export async function updateDailyIslamicLearning(id: string, payload: DailyIslamicLearningUpdate) {
  const { data, error } = await supabase
    .from('daily_islamic_learning')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update daily Islamic learning error:', error);
    return { data: null as DailyIslamicLearning | null, error };
  }
  return { data: data as DailyIslamicLearning, error: null };
}

export async function approveDailyIslamicLearning(id: string, reviewedBy: string) {
  const { data, error } = await supabase
    .from('daily_islamic_learning')
    .update({
      status: 'approved',
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Approve daily Islamic learning error:', error);
    return { data: null as DailyIslamicLearning | null, error };
  }
  return { data: data as DailyIslamicLearning, error: null };
}

export async function rejectDailyIslamicLearning(id: string, reviewedBy: string, rejectionReason: string) {
  const { data, error } = await supabase
    .from('daily_islamic_learning')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Reject daily Islamic learning error:', error);
    return { data: null as DailyIslamicLearning | null, error };
  }
  return { data: data as DailyIslamicLearning, error: null };
}

export interface TeachingContent {
  id: string;
  class_level: number;
  set_id: string;
  content_type: string;
  title: string;
  description: string | null;
  content: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'archived';
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  deletion_reason: string | null;
}

export type TeachingContentCreate = Pick<
  TeachingContent,
  'class_level' | 'set_id' | 'content_type' | 'title' | 'content'
> & {
  description?: string | null;
  status?: 'draft' | 'published' | 'archived';
  created_by?: string;
};

export type TeachingContentUpdate = Partial<TeachingContent>;

export const TEACHING_CONTENT_TYPE_OPTIONS = [
  { value: 'lesson', label: 'Lesson' },
  { value: 'explanation', label: 'Explanation' },
  { value: 'example', label: 'Example' },
  { value: 'practice', label: 'Practice' },
  { value: 'note', label: 'Note' },
] as const;

export const TEACHING_CONTENT_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
] as const;

export async function getTeachingContents(createdBy?: string, classLevel?: number, setId?: string, status?: string) {
  let query = supabase
    .from('ustad_teaching_content')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (createdBy) query = query.eq('created_by', createdBy);
  if (classLevel) query = query.eq('class_level', classLevel);
  if (setId) query = query.eq('set_id', setId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    console.error('Get teaching contents error:', error);
    return { data: [] as TeachingContent[], error };
  }
  return { data: (data ?? []) as TeachingContent[], error: null };
}

export async function createTeachingContent(payload: TeachingContentCreate) {
  const { data, error } = await supabase
    .from('ustad_teaching_content')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Create teaching content error:', error);
    return { data: null as TeachingContent | null, error };
  }
  return { data: data as TeachingContent, error: null };
}

export async function updateTeachingContent(id: string, payload: TeachingContentUpdate) {
  const { data, error } = await supabase
    .from('ustad_teaching_content')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update teaching content error:', error);
    return { data: null as TeachingContent | null, error };
  }
  return { data: data as TeachingContent, error: null };
}

export async function deleteTeachingContent(id: string, deletionReason: string) {
  const { data, error } = await supabase.rpc(
    'soft_delete_ustad_teaching_content',
    {
      p_id: id,
      p_reason: deletionReason,
    }
  );

  if (error) {
    console.error('[TEACHING DELETE] error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function restoreTeachingContent(id: string) {
  const { data, error } = await supabase.rpc(
    'restore_ustad_teaching_content',
    {
      p_id: id,
    }
  );

  if (error) {
    console.error('[TEACHING RESTORE] error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

