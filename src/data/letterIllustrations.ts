import type { ArabicLetter } from '@/data/letters';

export interface LetterVisual {
  emoji: string;
  label: string;
  arabicObjectName: string;
  accent: string;
  soft: string;
}

export const LETTER_VISUALS: Record<number, LetterVisual> = {
  1: { emoji: '🐰', label: 'Rabbit', arabicObjectName: 'أرنب', accent: '#22c55e', soft: '#dcfce7' },
  2: { emoji: '🏠', label: 'House', arabicObjectName: 'بيت', accent: '#f97316', soft: '#ffedd5' },
  3: { emoji: '🍎', label: 'Apple', arabicObjectName: 'تفاحة', accent: '#22c55e', soft: '#dcfce7' },
  4: { emoji: '🦊', label: 'Fox', arabicObjectName: 'ثعلب', accent: '#fbbf24', soft: '#fef3c7' },
  5: { emoji: '🐫', label: 'Camel', arabicObjectName: 'جمل', accent: '#fb92d6', soft: '#fce7f3' },
  6: { emoji: '🐴', label: 'Horse', arabicObjectName: 'حصان', accent: '#8b5cf6', soft: '#ede9fe' },
  7: { emoji: '🐑', label: 'Sheep', arabicObjectName: 'خروفة', accent: '#fb7185', soft: '#ffe4e6' },
  8: { emoji: '🐔', label: 'Chicken', arabicObjectName: 'دجاجة', accent: '#f59e0b', soft: '#fef3c7' },
  9: { emoji: '✨', label: 'Gold', arabicObjectName: 'ذهب', accent: '#fbbf24', soft: '#fef3c7' },
  10: { emoji: '🧠', label: 'Head', arabicObjectName: 'رأس', accent: '#22c55e', soft: '#dcfce7' },
  11: { emoji: '🦒', label: 'Giraffe', arabicObjectName: 'زرافة', accent: '#a78bfa', soft: '#ede9fe' },
  12: { emoji: '🌤️', label: 'Sky', arabicObjectName: 'سماء', accent: '#38bdf8', soft: '#dbeafe' },
  13: { emoji: '☀️', label: 'Sun', arabicObjectName: 'شمس', accent: '#fbbf24', soft: '#fff2c4' },
  14: { emoji: '🪨', label: 'Rock', arabicObjectName: 'صخرة', accent: '#64748b', soft: '#f1f5f9' },
  15: { emoji: '🐸', label: 'Frog', arabicObjectName: 'ضفدع', accent: '#10b981', soft: '#d1fae5' },
  16: { emoji: '🐦', label: 'Bird', arabicObjectName: 'طائر', accent: '#3b82f6', soft: '#dbeafe' },
  17: { emoji: '🌓', label: 'Shadow', arabicObjectName: 'ظل', accent: '#6366f1', soft: '#e0e7ff' },
  18: { emoji: '🟢', label: 'Lentil', arabicObjectName: 'عدسة', accent: '#84cc16', soft: '#dcfce7' },
  19: { emoji: '🛏️', label: 'Room', arabicObjectName: 'غرفة', accent: '#06b6d4', soft: '#cff8ff' },
  20: { emoji: '🐘', label: 'Elephant', arabicObjectName: 'فيل', accent: '#10b981', soft: '#d1fae5' },
  21: { emoji: '🐒', label: 'Monkey', arabicObjectName: 'قرد', accent: '#8b5cf6', soft: '#ede9fe' },
  22: { emoji: '🐕', label: 'Dog', arabicObjectName: 'كلب', accent: '#f97316', soft: '#ffedd5' },
  23: { emoji: '🍋', label: 'Lemon', arabicObjectName: 'ليمون', accent: '#eab308', soft: '#fef3c7' },
  24: { emoji: '💧', label: 'Water', arabicObjectName: 'ماء', accent: '#0ea5e0', soft: '#dbeafe' },
  25: { emoji: '⭐', label: 'Star', arabicObjectName: 'نجمة', accent: '#eab308', soft: '#fef3c7' },
  26: { emoji: '📱', label: 'Phone', arabicObjectName: 'هاتف', accent: '#f43f5e', soft: '#ffe4e6' },
  27: { emoji: '🌹', label: 'Rose', arabicObjectName: 'وردة', accent: '#ec4899', soft: '#fce7f3' },
  28: { emoji: '✋', label: 'Hand', arabicObjectName: 'يد', accent: '#f59e0b', soft: '#fef3c7' },
};

function buildIllustrationSvg(letter: ArabicLetter, visual: LetterVisual): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fffdf6" />
          <stop offset="100%" stop-color="#eefdf5" />
        </linearGradient>
        <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${visual.soft}" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#bg)"/>
      <circle cx="150" cy="110" r="70" fill="${visual.accent}" opacity="0.18"/>
      <circle cx="360" cy="110" r="70" fill="#ffffff" opacity="0.75"/>
      <rect x="52" y="22" width="296" height="176" rx="32" fill="url(#card)" stroke="rgba(15,118,110,0.12)"/>
      <g>
        <rect x="220" y="48" width="120" height="120" rx="24" fill="#ffffff" opacity="0.9"/>
        <text x="280" y="125" text-anchor="middle" font-size="64">${visual.emoji}</text>
      </g>
      <text x="76" y="145" text-anchor="middle" font-family="Amiri, serif" font-size="96" font-weight="700" fill="#0f766e">${letter.arabic}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getLetterIllustrationMeta(letter: ArabicLetter): LetterVisual {
  return (
    LETTER_VISUALS[letter.index] ?? {
      emoji: '✨',
      label: 'Bright idea',
      accent: '#14b8a6',
      soft: '#ccfbf1',
    }
  );
}

export function getLetterIllustrationUrl(letter: ArabicLetter): string {
  const visual = getLetterIllustrationMeta(letter);
  return buildIllustrationSvg(letter, visual);
}
