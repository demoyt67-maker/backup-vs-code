import { BackHeader } from '@/components/BackHeader';
import { CLASS_THEMES } from '@/theme';
import { useCMSClass1Data } from '@/hooks/useCMSClass1Data';
import { useCMSClass2Data } from '@/hooks/useCMSClass2Data';
import {
  SET1_TITLE, SET2_TITLE, SET3_TITLE, SET4_TITLE, SET5_TITLE, SET6_TITLE,
  SET1_TOTAL_LEVELS, SET2_TOTAL_LEVELS, SET3_TOTAL_LEVELS, SET4_TOTAL_LEVELS, SET5_TOTAL_LEVELS, SET6_TOTAL_LEVELS,
  SETS, type SetId, type LetterLevel, type HarakatLevel, type AlphabetOrderLevel, type SukoonLevel, type TanweenLevel, type WordLevel,
} from '@/data/learningSets';
import { ARABIC_LETTERS, type ArabicLetter } from '@/data/letters';
import { ARABIC_WORDS, type ArabicWord } from '@/data/arabicWords';
import { BookOpen, Layers, FileText, Monitor } from 'lucide-react';
import type { View } from '@/types';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  theme: Theme;
  onNavigate: (v: View) => void;
}

type ClassLevel = 1 | 2 | 3;

const CLASSES: { value: ClassLevel; label: string }[] = [
  { value: 1, label: 'Class 1' },
  { value: 2, label: 'Class 2' },
  { value: 3, label: 'Class 3' },
];

const SETS_BY_CLASS: Record<ClassLevel, SetId[]> = {
  1: ['set1', 'set2', 'set3', 'set4'],
  2: ['set5', 'set6'],
  3: [],
};

function getSetTitle(setId: SetId): string {
  return SETS.find((s) => s.id === setId)?.title ?? setId;
}

function renderSet1Level(level: LetterLevel) {
  return (
    <div key={level.level} className="rounded-xl border border-primary-100 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700">Level {level.level}</span>
        <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-600">
          {level.letters.length} letters
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {level.letters.map((letter) => (
          <span key={letter.index} className="rounded-lg border border-primary-100 bg-primary-50 px-2 py-1 text-sm font-semibold text-primary-900">
            {letter.arabic}
          </span>
        ))}
      </div>
    </div>
  );
}

function renderSet2Level(level: HarakatLevel) {
  return (
    <div key={level.level} className="rounded-xl border border-primary-100 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700">{level.title}</span>
        <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-600">
          {level.items.length} items
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {level.items.slice(0, 12).map((item, idx) => (
          <span key={idx} className="rounded-lg border border-primary-100 bg-primary-50 px-2 py-1 text-sm font-semibold text-primary-900">
            {item.letter.arabic}
            <span className="ml-1 text-xs text-primary-600">{item.haraka}</span>
          </span>
        ))}
        {level.items.length > 12 && (
          <span className="rounded-lg border border-primary-100 bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-600">
            +{level.items.length - 12} more
          </span>
        )}
      </div>
    </div>
  );
}

function renderSet3Level(level: AlphabetOrderLevel) {
  return (
    <div key={level.level} className="rounded-xl border border-primary-100 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700">{level.title}</span>
      </div>
      {level.description && <p className="mt-1 text-xs text-primary-700">{level.description}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {level.items.slice(0, 12).map((item, idx) => (
          <span key={idx} className="rounded-lg border border-primary-100 bg-primary-50 px-2 py-1 text-sm font-semibold text-primary-900">
            {item.arabic}
          </span>
        ))}
        {level.items.length > 12 && (
          <span className="rounded-lg border border-primary-100 bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-600">
            +{level.items.length - 12} more
          </span>
        )}
      </div>
    </div>
  );
}

function renderSet4Level(level: SukoonLevel) {
  return (
    <div key={level.level} className="rounded-xl border border-primary-100 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700">{level.title}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {level.items.slice(0, 12).map((item, idx) => (
          <span key={idx} className="rounded-lg border border-primary-100 bg-primary-50 px-2 py-1 text-sm font-semibold text-primary-900">
            {item.arabic}
          </span>
        ))}
        {level.items.length > 12 && (
          <span className="rounded-lg border border-primary-100 bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-600">
            +{level.items.length - 12} more
          </span>
        )}
      </div>
    </div>
  );
}

function renderSet5Level(level: TanweenLevel) {
  return (
    <div key={level.level} className="rounded-xl border border-primary-100 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700">{level.title}</span>
        <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-600">
          {level.items.length} items
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {level.items.slice(0, 12).map((item, idx) => (
          <span key={idx} className="rounded-lg border border-primary-100 bg-primary-50 px-2 py-1 text-sm font-semibold text-primary-900">
            {item.letter.arabic}
            <span className="ml-1 text-xs text-primary-600">{item.tanween}</span>
          </span>
        ))}
        {level.items.length > 12 && (
          <span className="rounded-lg border border-primary-100 bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-600">
            +{level.items.length - 12} more
          </span>
        )}
      </div>
    </div>
  );
}

function renderSet6Level(level: WordLevel) {
  return (
    <div key={level.level} className="rounded-xl border border-primary-100 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700">{level.title}</span>
      </div>
      {level.description && <p className="mt-1 text-xs text-primary-700">{level.description}</p>}
    </div>
  );
}

export function UstadLearningContentView({ theme, onNavigate }: Props) {
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(1);
  const [expandedSet, setExpandedSet] = useState<SetId | null>(null);

  const class1 = useCMSClass1Data();
  const class2 = useCMSClass2Data();

  const cmsByClass: Record<ClassLevel, { usingCMS: boolean; loading: boolean; error: string | null }> = {
    1: { usingCMS: class1.usingCMS, loading: class1.loading, error: class1.error },
    2: { usingCMS: class2.usingCMS, loading: class2.loading, error: class2.error },
    3: { usingCMS: false, loading: false, error: null },
  };

  const activeSets = SETS_BY_CLASS[selectedClass];

  return (
    <div className="screen-shell mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Learning Content" onBack={() => onNavigate('ustadPanel')} theme={theme} />

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-700">Class</span>
          <div className="flex rounded-xl border border-primary-200 bg-white p-1">
            {CLASSES.map((cls) => (
              <button
                key={cls.value}
                onClick={() => { setSelectedClass(cls.value); setExpandedSet(null); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedClass === cls.value ? 'bg-primary-600 text-white shadow-sm' : 'text-primary-700 hover:bg-primary-50'
                }`}
              >
                {cls.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {cmsByClass[selectedClass].error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {cmsByClass[selectedClass].error}
        </div>
      )}

      {selectedClass === 3 || activeSets.length === 0 ? (
        <div className="rounded-[1.4rem] border border-primary-100 bg-white p-6 text-center text-sm text-primary-700 shadow-sm">
          Learning content for this class is not yet available. Please check back later.
        </div>
      ) : (
        <div className="space-y-4">
          {activeSets.map((setId) => {
            const isExpanded = expandedSet === setId;
            const setTitle = getSetTitle(setId);
            const setTotalLevels =
              setId === 'set1' ? SET1_TOTAL_LEVELS :
              setId === 'set2' ? SET2_TOTAL_LEVELS :
              setId === 'set3' ? SET3_TOTAL_LEVELS :
              setId === 'set4' ? SET4_TOTAL_LEVELS :
              setId === 'set5' ? SET5_TOTAL_LEVELS :
              setId === 'set6' ? SET6_TOTAL_LEVELS : 0;

            let levels: React.ReactNode[] = [];
            if (selectedClass === 1) {
              if (setId === 'set1') levels = class1.levels.map(renderSet1Level);
              else if (setId === 'set2') levels = class1.harakatLevels.map(renderSet2Level);
              else if (setId === 'set3') levels = class1.alphabetOrderLevels.map(renderSet3Level);
              else if (setId === 'set4') levels = class1.sukoonLevels.map(renderSet4Level);
            } else if (selectedClass === 2) {
              if (setId === 'set5') levels = class2.tanweenLevels.map(renderSet5Level);
              else if (setId === 'set6') levels = class2.wordLevels.map(renderSet6Level);
            }

            return (
              <div key={setId} className="rounded-[1.4rem] border border-primary-100 bg-white shadow-sm">
                <button
                  onClick={() => setExpandedSet(isExpanded ? null : setId)}
                  className="flex w-full items-center justify-between p-5 text-left transition-all hover:bg-primary-50/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-xl">
                      <BookOpen size={20} className="text-primary-700" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-primary-900">{setTitle}</h3>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                        {setTotalLevels} levels
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cmsByClass[selectedClass].usingCMS && (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        <Monitor size={10} className="mr-1 inline" />
                        CMS
                      </span>
                    )}
                    <span className="text-xs font-bold text-primary-600">
                      {isExpanded ? 'Hide' : 'View'}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-primary-100 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Layers size={14} className="text-primary-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-primary-700">Levels</span>
                    </div>
                    {cmsByClass[selectedClass].loading ? (
                      <div className="py-8 text-center text-xs text-primary-600">Loading curriculum...</div>
                    ) : levels.length === 0 ? (
                      <div className="py-8 text-center text-xs text-primary-600">No levels available for this set.</div>
                    ) : (
                      <div className="space-y-3">{levels}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
