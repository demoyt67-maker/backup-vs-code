import type { ArabicLetter } from '@/data/letters';

export interface LetterVisual {
  emoji: string;
  label: string;
  arabicObjectName: string;
  accent: string;
  soft: string;
}

export const LETTER_VISUALS: Record<number, LetterVisual> = {
  1: { emoji: '☀️', label: 'Sunshine', arabicObjectName: 'شمس', accent: '#fbbf24', soft: '#fff2c4' },
  2: { emoji: '🎈', label: 'Balloon', arabicObjectName: 'بالونة', accent: '#f472b6', soft: '#fce7f3' },
  3: { emoji: '📖', label: 'Book', arabicObjectName: 'كتاب', accent: '#60a5fa', soft: '#dbeafe' },
  4: { emoji: '⭐', label: 'Star', arabicObjectName: 'نجمة', accent: '#f59e0b', soft: '#fef3c7' },
  5: { emoji: '🌳', label: 'Tree', arabicObjectName: 'شجرة', accent: '#34d399', soft: '#d1fae5' },
  6: { emoji: '🏠', label: 'Home', arabicObjectName: 'بيت', accent: '#f97316', soft: '#ffedd5' },
  7: { emoji: '🪁', label: 'Kite', arabicObjectName: 'طائرة ورقية', accent: '#8b5cf6', soft: '#e9d5ff' },
  8: { emoji: '🥁', label: 'Drum', arabicObjectName: 'طبل', accent: '#fb7185', soft: '#ffe4e6' },
  9: { emoji: '💎', label: 'Diamond', arabicObjectName: 'ألماس', accent: '#22c55e', soft: '#dcfce7' },
  10: { emoji: '🌈', label: 'Rainbow', arabicObjectName: 'قوس قزح', accent: '#38bdf8', soft: '#dbeafe' },
  11: { emoji: '🦓', label: 'Zebra', arabicObjectName: 'حمار وحشي', accent: '#a78bfa', soft: '#ede9fe' },
  12: { emoji: '🌞', label: 'Sunbeam', arabicObjectName: 'شعاع شمس', accent: '#fbbf24', soft: '#fef3c7' },
  13: { emoji: '🌼', label: 'Flower', arabicObjectName: 'زهرة', accent: '#f472b6', soft: '#fce7f3' },
  14: { emoji: '🍏', label: 'Apple', arabicObjectName: 'تفاحة', accent: '#22c55e', soft: '#dcfce7' },
  15: { emoji: '🧁', label: 'Cupcake', arabicObjectName: 'كعكة', accent: '#f9a8d4', soft: '#fdf2f8' },
  16: { emoji: '🧸', label: 'Teddy bear', arabicObjectName: 'دب', accent: '#c084fc', soft: '#f3e8ff' },
  17: { emoji: '🌙', label: 'Moon', arabicObjectName: 'قمر', accent: '#7c3aed', soft: '#ede9fe' },
  18: { emoji: '🦋', label: 'Butterfly', arabicObjectName: 'فراشة', accent: '#14b8a6', soft: '#ccfbf1' },
  19: { emoji: '🎵', label: 'Music', arabicObjectName: 'موسيقى', accent: '#fb7185', soft: '#ffe4e6' },
  20: { emoji: '🦄', label: 'Unicorn', arabicObjectName: 'حصان أسطوري', accent: '#7dd3fc', soft: '#dff6ff' },
  21: { emoji: '🚀', label: 'Rocket', arabicObjectName: 'صاروخ', accent: '#f97316', soft: '#ffedd5' },
  22: { emoji: '🪴', label: 'Plant', arabicObjectName: 'نبتة', accent: '#22c55e', soft: '#dcfce7' },
  23: { emoji: '🧺', label: 'Basket', arabicObjectName: 'سلة', accent: '#f59e0b', soft: '#fef3c7' },
  24: { emoji: '🍉', label: 'Watermelon', arabicObjectName: 'بطيخة', accent: '#10b981', soft: '#d1fae5' },
  25: { emoji: '🌙', label: 'Moonlight', arabicObjectName: 'ضوء القمر', accent: '#60a5fa', soft: '#dbeafe' },
  26: { emoji: '🧢', label: 'Cap', arabicObjectName: 'قبعة', accent: '#fbbf24', soft: '#fef3c7' },
  27: { emoji: '🌊', label: 'Wave', arabicObjectName: 'موجة', accent: '#38bdf8', soft: '#dbeafe' },
  28: { emoji: '🌟', label: 'Sparkle', arabicObjectName: 'لمعة', accent: '#f472b6', soft: '#fce7f3' },
};

function buildIllustrationSvg(letter: ArabicLetter, visual: LetterVisual): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
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
      <rect width="800" height="520" fill="url(#bg)"/>
      <circle cx="150" cy="110" r="70" fill="${visual.accent}" opacity="0.18"/>
      <circle cx="640" cy="115" r="88" fill="#ffffff" opacity="0.75"/>
      <circle cx="642" cy="120" r="58" fill="${visual.soft}" opacity="0.9"/>
      <rect x="52" y="54" width="696" height="412" rx="40" fill="url(#card)" stroke="rgba(15,118,110,0.12)"/>
      <rect x="108" y="116" width="202" height="202" rx="28" fill="#ffffff" opacity="0.8"/>
      <text x="208" y="242" text-anchor="middle" font-family="Amiri, serif" font-size="150" font-weight="700" fill="#0f766e">${letter.arabic}</text>
      <text x="415" y="170" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#0f766e">Letter name</text>
      <text x="415" y="222" font-family="Arial, sans-serif" font-size="44" font-weight="800" fill="#0f172a">${letter.english}</text>
      <text x="415" y="266" font-family="Noto Sans Malayalam, sans-serif" font-size="22" font-weight="600" fill="#4b5563">${letter.malayalam}</text>
      <rect x="415" y="302" width="214" height="70" rx="22" fill="#ffffff" opacity="0.82"/>
      <text x="455" y="351" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#0f766e">Memory cue</text>
      <text x="608" y="351" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="#0f172a">${visual.label}</text>
      <g transform="translate(520 140)">
        <rect x="0" y="0" width="160" height="160" rx="34" fill="#ffffff" opacity="0.9"/>
        <text x="80" y="110" text-anchor="middle" font-size="84">${visual.emoji}</text>
      </g>
      <circle cx="640" cy="396" r="10" fill="${visual.accent}" opacity="0.5"/>
      <circle cx="670" cy="384" r="7" fill="${visual.accent}" opacity="0.4"/>
      <circle cx="690" cy="405" r="6" fill="${visual.accent}" opacity="0.45"/>
      <text x="108" y="400" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0f766e">Child-friendly visual reminder</text>
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
