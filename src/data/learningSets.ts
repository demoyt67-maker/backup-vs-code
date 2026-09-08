import { ARABIC_LETTERS, type ArabicLetter } from '@/data/letters';

// ---------- Set 1: Arabic Letters ----------

export interface LetterLevel {
  level: number;
  letters: ArabicLetter[];
}

export const SET1_TITLE = 'Set 1 — Arabic Letters';
export const SET1_LEVEL_SIZE = 4;
export const SET1_TOTAL_LEVELS = 7;

export const SET1_LEVELS: LetterLevel[] = Array.from({ length: SET1_TOTAL_LEVELS }, (_, i) => ({
  level: i + 1,
  letters: ARABIC_LETTERS.slice(i * SET1_LEVEL_SIZE, i * SET1_LEVEL_SIZE + SET1_LEVEL_SIZE),
}));

// ---------- Set 2: Harakat ----------

export type HarakaType = 'fatha' | 'kasra' | 'damma';

export interface HarakaInfo {
  id: HarakaType;
  name: string;
  malayalam: string;
  symbol: string;
  mark: string;
}

export const HARAKAT: Record<HarakaType, HarakaInfo> = {
  fatha: { id: 'fatha', name: 'Fatha', malayalam: 'ഫത്‌ഹ', symbol: 'ـَ', mark: '\u064E' },
  kasra: { id: 'kasra', name: 'Kasra', malayalam: 'കിസ്ര', symbol: 'ـِ', mark: '\u0650' },
  damma: { id: 'damma', name: 'Damma', malayalam: 'ദമ്മ', symbol: 'ـُ', mark: '\u064F' },
};

export interface HarakatItem {
  letter: ArabicLetter;
  haraka: HarakaType;
}

export interface HarakatLevel {
  level: number;
  title: string;
  harakat: HarakaType[];
  letters: ArabicLetter[];
  items: HarakatItem[];
}

function buildItems(letters: ArabicLetter[], harakat: HarakaType[]): HarakatItem[] {
  const items: HarakatItem[] = [];
  for (const letter of letters) {
    for (const h of harakat) {
      items.push({ letter, haraka: h });
    }
  }
  return items;
}

const SET2_L1_LETTERS = ARABIC_LETTERS.slice(0, 4);
const SET2_L2_LETTERS = ARABIC_LETTERS.slice(4, 8);
const SET2_L3_LETTERS = ARABIC_LETTERS.slice(8, 12);
const SET2_COMBO_LETTERS = ARABIC_LETTERS.slice(0, 4);

export const SET2_TITLE = 'Set 2 — Harakat';
export const SET2_TOTAL_LEVELS = 7;

export const SET2_LEVELS: HarakatLevel[] = [
  { level: 1, title: 'Fatha', harakat: ['fatha'], letters: SET2_L1_LETTERS, items: buildItems(SET2_L1_LETTERS, ['fatha']) },
  { level: 2, title: 'Kasra', harakat: ['kasra'], letters: SET2_L2_LETTERS, items: buildItems(SET2_L2_LETTERS, ['kasra']) },
  { level: 3, title: 'Damma', harakat: ['damma'], letters: SET2_L3_LETTERS, items: buildItems(SET2_L3_LETTERS, ['damma']) },
  { level: 4, title: 'Fatha + Kasra', harakat: ['fatha', 'kasra'], letters: SET2_COMBO_LETTERS, items: buildItems(SET2_COMBO_LETTERS, ['fatha', 'kasra']) },
  { level: 5, title: 'Fatha + Damma', harakat: ['fatha', 'damma'], letters: SET2_COMBO_LETTERS, items: buildItems(SET2_COMBO_LETTERS, ['fatha', 'damma']) },
  { level: 6, title: 'Kasra + Damma', harakat: ['kasra', 'damma'], letters: SET2_COMBO_LETTERS, items: buildItems(SET2_COMBO_LETTERS, ['kasra', 'damma']) },
  { level: 7, title: 'Mixed Harakat', harakat: ['fatha', 'kasra', 'damma'], letters: SET2_COMBO_LETTERS, items: buildItems(SET2_COMBO_LETTERS, ['fatha', 'kasra', 'damma']) },
];

export function applyHaraka(letter: string, haraka: HarakaType): string {
  return letter + HARAKAT[haraka].mark;
}

export function harakatItemKey(letterIndex: number, haraka: HarakaType): string {
  return `${letterIndex}-${haraka}`;
}

// ---------- Set 4: Sukoon ----------

export const SUKOON_MARK = '\u0652'; // ARABIC SUKUN
export const SUKOON_SYMBOL = 'ـْ';

export interface SukoonItem {
  arabic: string;     // full rendered form, e.g. "بْ"
  label: string;      // English label
  malayalam: string;  // Malayalam label
}

export interface SukoonLevel {
  level: number;
  title: string;
  items: SukoonItem[];
}

export const SET4_TITLE = 'Set 4 — Sukoon';
export const SET4_TOTAL_LEVELS = 5;

function withSukoon(letter: string): string {
  return letter + SUKOON_MARK;
}

// beginner-friendly base letters for sukoon levels
const SET4_L1_LETTERS = ARABIC_LETTERS.slice(0, 5); // ا ب ت ث ج
const SET4_L2_LETTERS = ARABIC_LETTERS.slice(0, 6); // ا ب ت ث ج ح

export const SET4_LEVELS: SukoonLevel[] = [
  {
    level: 1,
    title: 'Recognize Sukoon',
    items: SET4_L1_LETTERS.map((l) => ({
      arabic: withSukoon(l.arabic),
      label: `${l.english} + Sukoon`,
      malayalam: l.malayalam,
    })),
  },
  {
    level: 2,
    title: 'Letter + Sukoon',
    items: SET4_L2_LETTERS.map((l) => ({
      arabic: withSukoon(l.arabic),
      label: `${l.english}ْ`,
      malayalam: l.malayalam,
    })),
  },
  {
    level: 3,
    title: 'Simple 2-letter combinations',
    items: [
      { arabic: 'بْتَ', label: 'Bt-a', malayalam: 'ബ്‌-ത' },
      { arabic: 'تْبَ', label: 'Tb-a', malayalam: 'ത്‌-ബ' },
      { arabic: 'مْنَ', label: 'Mn-a', malayalam: 'മ്‌-ന' },
      { arabic: 'دْرَ', label: 'Dr-a', malayalam: 'ദ്‌-റ' },
      { arabic: 'سْلَ', label: 'Sl-a', malayalam: 'സ്‌-ല' },
      { arabic: 'كْلَ', label: 'Kl-a', malayalam: 'ക്‌-ല' },
    ],
  },
  {
    level: 4,
    title: 'Simple 3-letter combinations',
    items: [
      { arabic: 'بَتْبَ', label: 'Ba-tb-a', malayalam: 'ബ-ത്‌-ബ' },
      { arabic: 'مَكْتَ', label: 'Ma-kt-a', malayalam: 'മ-ക്‌-ത' },
      { arabic: 'سَبْحَ', label: 'Sa-bh-a', malayalam: 'സ-ബ്‌-ഹ' },
      { arabic: 'دَرْسَ', label: 'Da-rs-a', malayalam: 'ദ-റ്‌-സ' },
      { arabic: 'كَتْبَ', label: 'Ka-tb-a', malayalam: 'ക-ത്‌-ബ' },
      { arabic: 'نَمْلَ', label: 'Na-ml-a', malayalam: 'ന-മ്‌-ല' },
    ],
  },
  {
    level: 5,
    title: 'Easy Sukoon reading',
    items: [
      { arabic: 'أَمْسَ', label: 'Amsa (yesterday)', malayalam: 'അംസ' },
      { arabic: 'أَبْ', label: 'Ab (father)', malayalam: 'അബ്' },
      { arabic: 'أَخْ', label: 'Akh (brother)', malayalam: 'അഖ്' },
      { arabic: 'هُوَ', label: 'Huwa (he)', malayalam: 'ഹുവ' },
      { arabic: 'مِنْ', label: 'Min (from)', malayalam: 'മിൻ' },
      { arabic: 'عَنْ', label: 'An (about)', malayalam: 'അൻ' },
    ],
  },
];

// ---------- Set 5: Tanween ----------

export type TanweenType = 'fathatain' | 'kasratain' | 'dammatain';

export interface TanweenInfo {
  id: TanweenType;
  name: string;
  malayalam: string;
  symbol: string;
  mark: string;
}

export const TANWEEN: Record<TanweenType, TanweenInfo> = {
  fathatain: { id: 'fathatain', name: 'Fathatain', malayalam: 'ഫത്‌ഹതൈൻ', symbol: 'ـً', mark: '\u064B' },
  kasratain: { id: 'kasratain', name: 'Kasratain', malayalam: 'കിസ്രതൈൻ', symbol: 'ـٍ', mark: '\u064D' },
  dammatain: { id: 'dammatain', name: 'Dammatain', malayalam: 'ദമ്മതൈൻ', symbol: 'ـٌ', mark: '\u064C' },
};

export interface TanweenItem {
  letter: ArabicLetter;
  tanween: TanweenType;
}

export interface TanweenLevel {
  level: number;
  title: string;
  tanween: TanweenType[];
  letters: ArabicLetter[];
  items: TanweenItem[];
  // Reading items for level 5
  readingItems?: SukoonItem[];
}

function buildTanweenItems(letters: ArabicLetter[], tanween: TanweenType[]): TanweenItem[] {
  const items: TanweenItem[] = [];
  for (const letter of letters) {
    for (const t of tanween) {
      items.push({ letter, tanween: t });
    }
  }
  return items;
}

function applyTanween(letter: string, t: TanweenType): string {
  return letter + TANWEEN[t].mark;
}

export { applyTanween };

const SET5_L1_LETTERS = ARABIC_LETTERS.slice(0, 4); // ا ب ت ث
const SET5_L2_LETTERS = ARABIC_LETTERS.slice(4, 8); // ج ح خ د
const SET5_L3_LETTERS = ARABIC_LETTERS.slice(8, 12); // ذ ر ز س
const SET5_COMBO_LETTERS = ARABIC_LETTERS.slice(0, 4);

export const SET5_TITLE = 'Set 5 — Tanween';
export const SET5_TOTAL_LEVELS = 5;

export const SET5_LEVELS: TanweenLevel[] = [
  {
    level: 1,
    title: 'Fathatain',
    tanween: ['fathatain'],
    letters: SET5_L1_LETTERS,
    items: buildTanweenItems(SET5_L1_LETTERS, ['fathatain']),
  },
  {
    level: 2,
    title: 'Kasratain',
    tanween: ['kasratain'],
    letters: SET5_L2_LETTERS,
    items: buildTanweenItems(SET5_L2_LETTERS, ['kasratain']),
  },
  {
    level: 3,
    title: 'Dammatain',
    tanween: ['dammatain'],
    letters: SET5_L3_LETTERS,
    items: buildTanweenItems(SET5_L3_LETTERS, ['dammatain']),
  },
  {
    level: 4,
    title: 'Mixed Tanween',
    tanween: ['fathatain', 'kasratain', 'dammatain'],
    letters: SET5_COMBO_LETTERS,
    items: buildTanweenItems(SET5_COMBO_LETTERS, ['fathatain', 'kasratain', 'dammatain']),
  },
  {
    level: 5,
    title: 'Easy Tanween reading',
    tanween: ['fathatain', 'kasratain', 'dammatain'],
    letters: SET5_COMBO_LETTERS,
    items: buildTanweenItems(SET5_COMBO_LETTERS, ['fathatain']),
    readingItems: [
      { arabic: 'كِتَابًا', label: 'Kitaban (a book)', malayalam: 'കിതാബൻ' },
      { arabic: 'بَيْتٍ', label: 'Baytin (a house)', malayalam: 'ബൈതിൻ' },
      { arabic: 'قَلَمٌ', label: 'Qalamin (a pen)', malayalam: 'ഖലമുൻ' },
      { arabic: 'مَدْرَسَةٌ', label: 'Madrasatun (school)', malayalam: 'മദ്രസതുൻ' },
      { arabic: 'وَلَدٌ', label: 'Waladun (a boy)', malayalam: 'വലദുൻ' },
      { arabic: 'نَارٌ', label: 'Narin (fire)', malayalam: 'നാരിൻ' },
    ],
  },
];

export function tanweenItemKey(letterIndex: number, t: TanweenType): string {
  return `${letterIndex}-${t}`;
}

// ---------- Set 6: Arabic Words ----------

export interface WordLevel {
  level: number;
  title: string;
  description: string;
}

export const SET6_TITLE = 'Set 6 — Arabic Words & Fun Learning';
export const SET6_TOTAL_LEVELS = 6;

export const SET6_LEVELS: WordLevel[] = [
  { level: 1, title: 'Learn Simple Words', description: 'Arabic words with Malayalam & English meanings' },
  { level: 2, title: 'Word Matching (Arabic → Malayalam)', description: 'Match Arabic words to their Malayalam meanings' },
  { level: 3, title: 'Arabic to English Matching', description: 'Match Arabic words to their English meanings' },
  { level: 4, title: 'Find the Correct Word', description: 'Choose the right Arabic word from 4 options' },
  { level: 5, title: 'Word Memory Game', description: 'Remember and match word pairs' },
  { level: 6, title: 'Mixed Word Challenge', description: 'Mix of all activities with scoring' },
];

// ---------- Sets registry ----------

export type SetId = 'set1' | 'set2' | 'set4' | 'set5' | 'set6';

export interface SetMeta {
  id: SetId;
  title: string;
  totalLevels: number;
}

export const SETS: SetMeta[] = [
  { id: 'set1', title: SET1_TITLE, totalLevels: SET1_TOTAL_LEVELS },
  { id: 'set2', title: SET2_TITLE, totalLevels: SET2_TOTAL_LEVELS },
  { id: 'set4', title: SET4_TITLE, totalLevels: SET4_TOTAL_LEVELS },
  { id: 'set5', title: SET5_TITLE, totalLevels: SET5_TOTAL_LEVELS },
  { id: 'set6', title: SET6_TITLE, totalLevels: SET6_TOTAL_LEVELS },
];
