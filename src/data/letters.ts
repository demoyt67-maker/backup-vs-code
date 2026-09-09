export interface ArabicLetter {
  index: number;
  arabic: string;
  english: string;
  malayalam: string;
}

export const ARABIC_LETTERS: ArabicLetter[] = [
  { index: 1, arabic: 'ا', english: 'Alif', malayalam: 'അലിഫ്' },
  { index: 2, arabic: 'ب', english: 'Baa', malayalam: 'ബാഅ്' },
  { index: 3, arabic: 'ت', english: 'Taa', malayalam: 'താഅ്' },
  { index: 4, arabic: 'ث', english: 'Thaa', malayalam: 'ഥാഅ്' },
  { index: 5, arabic: 'ج', english: 'Jeem', malayalam: 'ജീം' },
  { index: 6, arabic: 'ح', english: 'Haa', malayalam: 'ഹാഅ്' },
  { index: 7, arabic: 'خ', english: 'Khaa', malayalam: 'ഖാഅ്' },
  { index: 8, arabic: 'د', english: 'Daal', malayalam: 'ദാൽ' },
  { index: 9, arabic: 'ذ', english: 'Dhaal', malayalam: 'ധാഅ്' },
  { index: 10, arabic: 'ر', english: 'Raa', malayalam: 'റാഅ്' },
  { index: 11, arabic: 'ز', english: 'Zaay', malayalam: 'സായ' },
  { index: 12, arabic: 'س', english: 'Seen', malayalam: 'സീൻ' },
  { index: 13, arabic: 'ش', english: 'Sheen', malayalam: 'ഷീൻ' },
  { index: 14, arabic: 'ص', english: 'Saad', malayalam: 'സ്വാദ്' },
  { index: 15, arabic: 'ض', english: 'Daad', malayalam: 'ദ്വാദ്' },
  { index: 16, arabic: 'ط', english: 'Ṭaa', malayalam: 'ത്വാഅ്' },
  { index: 17, arabic: 'ظ', english: 'Zhaa', malayalam: 'ള്വാഅ്' },
  { index: 18, arabic: 'ع', english: 'Ayn', malayalam: 'അയ്ൻ' },
  { index: 19, arabic: 'غ', english: 'Ghayn', malayalam: 'ഗയ്ൻ' },
  { index: 20, arabic: 'ف', english: 'Faa', malayalam: 'ഫാഅ്' },
  { index: 21, arabic: 'ق', english: 'Qaaf', malayalam: 'ഖാഫ്' },
  { index: 22, arabic: 'ك', english: 'Kaaf', malayalam: 'കാഫ്' },
  { index: 23, arabic: 'ل', english: 'Laam', malayalam: 'ലാം' },
  { index: 24, arabic: 'م', english: 'Meem', malayalam: 'മീം' },
  { index: 25, arabic: 'ن', english: 'Noon', malayalam: 'നൂൻ' },
  { index: 26, arabic: 'ه', english: 'Haa', malayalam: 'ഹാഅ്' },
  { index: 27, arabic: 'و', english: 'Waaw', malayalam: 'വാവ്' },
  { index: 28, arabic: 'ي', english: 'Yaa', malayalam: 'യാഅ്' },
];

export const TOTAL_LETTERS = ARABIC_LETTERS.length;
