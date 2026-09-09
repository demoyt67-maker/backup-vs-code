import type { HarakaType } from '@/data/learningSets';

export const INTERACTIVE_HARAKAT_PRACTICE_DEFINITIONS = [
  { id: 'interactive-harakat-1', baseLetter: 'ب', promptHaraka: 'fatha' },
  { id: 'interactive-harakat-2', baseLetter: 'ت', promptHaraka: 'fatha' },
  { id: 'interactive-harakat-3', baseLetter: 'ج', promptHaraka: 'fatha' },
  { id: 'interactive-harakat-4', baseLetter: 'ح', promptHaraka: 'fatha' },
  { id: 'interactive-harakat-5', baseLetter: 'س', promptHaraka: 'fatha' },
  { id: 'interactive-harakat-6', baseLetter: 'د', promptHaraka: 'kasra' },
  { id: 'interactive-harakat-7', baseLetter: 'ر', promptHaraka: 'kasra' },
  { id: 'interactive-harakat-8', baseLetter: 'م', promptHaraka: 'kasra' },
  { id: 'interactive-harakat-9', baseLetter: 'ي', promptHaraka: 'kasra' },
  { id: 'interactive-harakat-10', baseLetter: 'ل', promptHaraka: 'kasra' },
  { id: 'interactive-harakat-11', baseLetter: 'ت', promptHaraka: 'damma' },
  { id: 'interactive-harakat-12', baseLetter: 'ج', promptHaraka: 'damma' },
  { id: 'interactive-harakat-13', baseLetter: 'ل', promptHaraka: 'damma' },
  { id: 'interactive-harakat-14', baseLetter: 'ن', promptHaraka: 'damma' },
  { id: 'interactive-harakat-15', baseLetter: 'و', promptHaraka: 'damma' },
] as const satisfies ReadonlyArray<{
  id: string;
  baseLetter: string;
  promptHaraka: HarakaType;
}>;

export const INTERACTIVE_HARAKAT_PRACTICE_COUNT = INTERACTIVE_HARAKAT_PRACTICE_DEFINITIONS.length;
