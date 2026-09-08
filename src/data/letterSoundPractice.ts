export interface LetterSoundPracticeItem {
  id: string;
  display: string;
  letterName: string;
  harakaName: string;
  soundId: 'a' | 'ee' | 'oo';
  soundGuide: string;
  pronunciationTip: string;
}

export const LETTER_SOUND_PRACTICE_ITEMS: LetterSoundPracticeItem[] = [
  {
    id: 'sound-fatha-1',
    display: 'اَ',
    letterName: 'Alif',
    harakaName: 'Fatha',
    soundId: 'a',
    soundGuide: 'Say “a” slowly: a-a-a',
    pronunciationTip: 'Like the sound in “apple”.',
  },
  {
    id: 'sound-fatha-2',
    display: 'ثَ',
    letterName: 'Thaa',
    harakaName: 'Fatha',
    soundId: 'a',
    soundGuide: 'Say “a” slowly: a-a-a',
    pronunciationTip: 'Short and bright, like “a” in “ant”.',
  },
  {
    id: 'sound-kasra-1',
    display: 'بِ',
    letterName: 'Baa',
    harakaName: 'Kasra',
    soundId: 'ee',
    soundGuide: 'Say “ee” slowly: ee-ee',
    pronunciationTip: 'Like the sound in “keep”.',
  },
  {
    id: 'sound-kasra-2',
    display: 'حِ',
    letterName: 'Haa',
    harakaName: 'Kasra',
    soundId: 'ee',
    soundGuide: 'Say “ee” slowly: ee-ee',
    pronunciationTip: 'Like the sound in “tree”.',
  },
  {
    id: 'sound-damma-1',
    display: 'تُ',
    letterName: 'Taa',
    harakaName: 'Damma',
    soundId: 'oo',
    soundGuide: 'Say “oo” slowly: oo-oo',
    pronunciationTip: 'Like the sound in “book”.',
  },
  {
    id: 'sound-damma-2',
    display: 'خُ',
    letterName: 'Khaa',
    harakaName: 'Damma',
    soundId: 'oo',
    soundGuide: 'Say “oo” slowly: oo-oo',
    pronunciationTip: 'Like the sound in “moon”.',
  },
];
