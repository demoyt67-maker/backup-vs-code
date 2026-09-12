import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'madrasa_feature_control';

const FEATURES = [
  { key: 'learning', title: 'Learning' },
  { key: 'quiz', title: 'Quiz' },
  { key: 'writing', title: 'Writing Practice' },
  { key: 'harakat', title: 'Harakat Practice' },
] as const;

type FeatureKey = typeof FEATURES[number]['key'];

interface FeatureControlRow {
  id: string;
  learning: boolean;
  quiz: boolean;
  writing: boolean;
  harakat: boolean;
}

const defaultFeatures = (): Record<FeatureKey, boolean> => {
  const initial = {} as Record<FeatureKey, boolean>;
  FEATURES.forEach((f) => {
    initial[f.key] = true;
  });
  return initial;
};

function loadFeatures(): Record<FeatureKey, boolean> {
  if (typeof window === 'undefined') return defaultFeatures();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultFeatures();
    const parsed = JSON.parse(raw);
    const merged = defaultFeatures();
    FEATURES.forEach((f) => {
      if (typeof parsed[f.key] === 'boolean') {
        merged[f.key] = parsed[f.key];
      }
    });
    return merged;
  } catch {
    return defaultFeatures();
  }
}

function saveFeatures(features: Record<FeatureKey, boolean>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(features));
  } catch {
    // ignore
  }
}

export function useFeatureControl() {
  const [features, setFeatures] = useState<Record<FeatureKey, boolean>>(() => loadFeatures());
  const [initialized, setInitialized] = useState(false);
  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function loadFromSupabase() {
      try {
        const { data, error } = await supabase
          .from('feature_control')
          .select('*')
          .eq('id', 'global')
          .single();

        if (!cancelled) {
          if (error || !data) {
            setInitialized(true);
            return;
          }

          const row = data as FeatureControlRow;
          const remote: Record<FeatureKey, boolean> = {
            learning: row.learning,
            quiz: row.quiz,
            writing: row.writing,
            harakat: row.harakat,
          };

          setFeatures(remote);
          saveFeatures(remote);
          setInitialized(true);
        }
      } catch {
        if (!cancelled) {
          setInitialized(true);
        }
      }
    }

    loadFromSupabase();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;
    saveFeatures(features);
  }, [features, initialized]);

  const toggleFeature = async (key: FeatureKey) => {
    setFeatures((prev) => {
      const next = { ...prev, [key]: !prev[key] };

      if (isSuperAdmin) {
        void supabase
          .from('feature_control')
          .update({ [key]: next[key] })
          .eq('id', 'global');
      }

      return next;
    });
  };

  const isEnabled = (key: FeatureKey) => features[key] !== false;

  return {
    features,
    toggleFeature,
    isEnabled,
    initialized,
  };
}
