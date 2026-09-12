import { useState, useEffect } from 'react';
import type { View } from '@/types';
import { CLASS_THEMES } from '@/theme';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

const STORAGE_KEY = 'madrasa_feature_control';

const FEATURES = [
  {
    key: 'learning',
    title: 'Learning',
    description: 'Arabic letter learning, levels, and illustrations.',
    icon: '📘',
  },
  {
    key: 'quiz',
    title: 'Quiz',
    description: 'Letter identification quiz and practice tests.',
    icon: '❓',
  },
  {
    key: 'writing',
    title: 'Writing Practice',
    description: 'Trace Arabic letters with guided canvas practice.',
    icon: '✍️',
  },
  {
    key: 'harakat',
    title: 'Harakat Practice',
    description: 'Vowel sign practice and interactive exercises.',
    icon: '✨',
  },
];

const defaultFeatures = (): Record<string, boolean> => {
  const initial: Record<string, boolean> = {};
  FEATURES.forEach((f) => {
    initial[f.key] = true;
  });
  return initial;
};

export function FeatureControlView({ onNavigate, theme }: Props) {
  const [features, setFeatures] = useState<Record<string, boolean>>(() => {
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
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(features));
    } catch {
      // ignore storage errors
    }
  }, [features]);

  const toggleFeature = (key: string) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="screen-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary-900 md:text-4xl">Feature Control</h1>
        <p className="mt-2 text-sm text-primary-700">
          Manage feature availability across the app. Toggle features on or off for different classes and user roles.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {FEATURES.map((feature, index) => {
          const isOn = features[feature.key];
          return (
            <div
              key={feature.key}
              className={`liquid-panel rounded-[1.4rem] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isOn ? '' : 'opacity-70'}`}
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                animationDelay: `${index * 80}ms`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: theme.accentSoft }}>
                    {feature.icon}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-primary-900">{feature.title}</h3>
                    <p className="mt-1 text-xs text-primary-700">{feature.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeature(feature.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  style={{
                    backgroundColor: isOn ? '#22c55e' : '#d1d5db',
                  }}
                  role="switch"
                  aria-checked={isOn}
                  aria-label={`${feature.title} toggle`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-[1.4rem] border border-primary-100 bg-primary-50/50 p-4">
        <p className="text-sm font-bold text-primary-900">Feature Control</p>
        <p className="mt-1 text-xs text-primary-700">
          Toggles are currently local only. Supabase sync and app-wide feature gating are not yet connected.
        </p>
      </div>
    </div>
  );
}
