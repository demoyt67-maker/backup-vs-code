// Student name validation helpers.
// Basic format validation is separate from inappropriate-language detection.

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 60;

// Allowed characters: Unicode letters, spaces, hyphens, apostrophes.
const ALLOWED_NAME_PATTERN = /^[\p{L}\p{M}\s'-]+$/u;

// Common substitutions used for obfuscation.
const SUBSTITUTIONS: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '2': 'z',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '6': 'g',
  '7': 't',
  '8': 'b',
  '9': 'g',
  '@': 'a',
  '$': 's',
  '!': 'i',
};

// Language-specific blocked terms. Keep lists curated and lowercase.
// These are matched as whole tokens after normalization to reduce false positives.
const BLOCKED_TERMS: Record<string, string[]> = {
  en: [
    'fuck',
    'fuc',
    'fck',
    'shit',
    'bitch',
    'asshole',
    'bastard',
    'dick',
    'pussy',
    'cunt',
    'slut',
    'whore',
  ],
  ml: [
    'പൊട്ട',
    'പാവം',
  ],
  ar: [
    'كس',
    'شرموط',
    'قحبة',
  ],
};

function normalizeForProfanityCheck(input: string): string {
  // NFKC normalization + case folding.
  let s = input.normalize('NFKC').toLowerCase();
  // Remove separators and punctuation that may be inserted for obfuscation.
  s = s.replace(/[\s.\-_*]+/g, '');
  // Apply common substitutions.
  let out = '';
  for (const ch of s) {
    out += SUBSTITUTIONS[ch] ?? ch;
  }
  return out;
}

function tokenize(input: string): string[] {
  return input
    .normalize('NFKC')
    .toLowerCase()
    .split(/[\s'-]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function validateStudentNameFormat(name: string): { ok: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, error: 'Please enter your real name.' };
  }
  if (trimmed.length < MIN_NAME_LENGTH) {
    return { ok: false, error: 'Please enter your real name.' };
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return { ok: false, error: 'Please enter a shorter name.' };
  }
  if (!ALLOWED_NAME_PATTERN.test(trimmed)) {
    return { ok: false, error: 'Please use letters, spaces, hyphens, or apostrophes.' };
  }
  if (!/\p{L}/u.test(trimmed)) {
    return { ok: false, error: 'Please enter your real name.' };
  }
  return { ok: true };
}

export function detectInappropriateName(name: string): boolean {
  const normalized = normalizeForProfanityCheck(name);
  const tokens = tokenize(name).map((t) => normalizeForProfanityCheck(t));

  for (const lang of Object.keys(BLOCKED_TERMS)) {
    for (const term of BLOCKED_TERMS[lang]) {
      const normTerm = normalizeForProfanityCheck(term);
      // Whole-token match first.
      if (tokens.includes(normTerm)) return true;
      // Careful substring match only when the normalized full string equals or
      // contains the term as a contiguous run (already separator-stripped).
      if (normalized.includes(normTerm) && normTerm.length >= 3) return true;
    }
  }
  return false;
}

export function validateStudentName(name: string): { ok: boolean; error?: string } {
  const format = validateStudentNameFormat(name);
  if (!format.ok) return format;
  if (detectInappropriateName(name)) {
    return { ok: false, error: 'Please enter your real name without offensive words.' };
  }
  return { ok: true };
}
