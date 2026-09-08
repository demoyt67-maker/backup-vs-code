// Set 6 — Arabic Words: central word data structure
// All word-based activities reuse this data to avoid duplication.

export type WordCategory = 'family' | 'animals' | 'food' | 'school' | 'objects';

export interface ArabicWord {
  id: string;
  arabic: string;
  malayalam: string;
  english: string;
  category: WordCategory;
}

export const CATEGORY_LABELS: Record<WordCategory, { english: string; malayalam: string }> = {
  family: { english: 'Family', malayalam: 'കുടുംബം' },
  animals: { english: 'Animals', malayalam: 'മൃഗങ്ങൾ' },
  food: { english: 'Food', malayalam: 'ഭക്ഷണം' },
  school: { english: 'School', malayalam: 'സ്കൂൾ' },
  objects: { english: 'Common Objects', malayalam: 'സാധാരണ വസ്തുക്കൾ' },
};

// Beginner-friendly words across categories
export const ARABIC_WORDS: ArabicWord[] = [
  // Family
  { id: 'w-aba', arabic: 'أَب', malayalam: 'അച്ഛൻ', english: 'Father', category: 'family' },
  { id: 'w-umm', arabic: 'أُم', malayalam: 'അമ്മ', english: 'Mother', category: 'family' },
  { id: 'w-ibn', arabic: 'ابْن', malayalam: 'മകൻ', english: 'Son', category: 'family' },
  { id: 'w-bint', arabic: 'بِنْت', malayalam: 'മകൾ', english: 'Daughter', category: 'family' },
  { id: 'w-akh', arabic: 'أَخ', malayalam: 'സഹോദരൻ', english: 'Brother', category: 'family' },
  { id: 'w-ukht', arabic: 'أُخْت', malayalam: 'സഹോദരി', english: 'Sister', category: 'family' },
  // Animals
  { id: 'w-kalb', arabic: 'كَلْب', malayalam: 'നായ', english: 'Dog', category: 'animals' },
  { id: 'w-qitt', arabic: 'قِطّ', malayalam: 'പൂച്ച', english: 'Cat', category: 'animals' },
  { id: 'w-hisn', arabic: 'حِصَان', malayalam: 'കുതിര', english: 'Horse', category: 'animals' },
  { id: 'w-samak', arabic: 'سَمَك', malayalam: 'മീൻ', english: 'Fish', category: 'animals' },
  { id: 'w-taair', arabic: 'طَائِر', malayalam: 'പക്ഷി', english: 'Bird', category: 'animals' },
  { id: 'w-baqara', arabic: 'بَقَرَة', malayalam: 'പശു', english: 'Cow', category: 'animals' },
  // Food
  { id: 'w-ma', arabic: 'مَاء', malayalam: 'വെള്ളം', english: 'Water', category: 'food' },
  { id: 'w-hubz', arabic: 'خُبْز', malayalam: 'റൊട്ട', english: 'Bread', category: 'food' },
  { id: 'w-halib', arabic: 'حَلِيب', malayalam: 'പാൽ', english: 'Milk', category: 'food' },
  { id: 'w-fakiha', arabic: 'فَاكِهَة', malayalam: 'പഴം', english: 'Fruit', category: 'food' },
  { id: 'w-lahm', arabic: 'لَحْم', malayalam: 'മാംസം', english: 'Meat', category: 'food' },
  { id: 'w-bidh', arabic: 'بَيْض', malayalam: 'മുട്ട', english: 'Egg', category: 'food' },
  // School
  { id: 'w-kitab', arabic: 'كِتَاب', malayalam: 'പുസ്തകം', english: 'Book', category: 'school' },
  { id: 'w-qalam', arabic: 'قَلَم', malayalam: 'പേന', english: 'Pen', category: 'school' },
  { id: 'w-madrasa', arabic: 'مَدْرَسَة', malayalam: 'സ്കൂൾ', english: 'School', category: 'school' },
  { id: 'w-waraq', arabic: 'وَرَق', malayalam: 'കടലാസ്', english: 'Paper', category: 'school' },
  { id: 'w-kursi', arabic: 'كُرْسِي', malayalam: 'കസേര', english: 'Chair', category: 'school' },
  { id: 'w-tawb', arabic: 'تَوْب', malayalam: 'മേശ', english: 'Table', category: 'school' },
  // Common objects
  { id: 'w-bayt', arabic: 'بَيْت', malayalam: 'വീട്', english: 'House', category: 'objects' },
  { id: 'w-bab', arabic: 'بَاب', malayalam: 'വാതിൽ', english: 'Door', category: 'objects' },
  { id: 'w-nar', arabic: 'نَار', malayalam: 'തീ', english: 'Fire', category: 'objects' },
  { id: 'w-shams', arabic: 'شَمْس', malayalam: 'സൂര്യൻ', english: 'Sun', category: 'objects' },
  { id: 'w-qamar', arabic: 'قَمَر', malayalam: 'ചന്ദ്രൻ', english: 'Moon', category: 'objects' },
  { id: 'w-sa', arabic: 'سَاعَة', malayalam: 'വാച്ച്', english: 'Clock', category: 'objects' },
];

// Helper: shuffle array (returns new array)
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Helper: pick N random words from a pool
export function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
