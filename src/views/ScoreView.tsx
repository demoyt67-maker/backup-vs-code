import { Trophy, PenTool, BookOpen, Percent, RotateCcw, Home, Award } from 'lucide-react';
import { TOTAL_LETTERS } from '@/data/letters';
import { BackHeader } from '@/components/BackHeader';
import type { ScoreData } from '@/hooks/useScoreStore';

interface Props {
  onHome: () => void;
  score: ScoreData;
  onReset: () => void;
}

export function ScoreView({ onHome, score, onReset }: Props) {
  const quizPct = Math.round((score.lastQuizScore / score.quizTotal) * 100) || 0;
  const bestPct = Math.round((score.bestQuizScore / score.quizTotal) * 100) || 0;
  const writingPct = Math.round((score.writingCompleted / TOTAL_LETTERS) * 100);

  return (
    <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="My Score" onBack={onHome} subtitle="Your learning progress" />

      {/* quiz card */}
      <div className="screen-panel-dark liquid-panel relative mb-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#123f38] to-[#082b25] p-5 text-white shadow-2xl sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
            <Trophy size={24} />
          </span>
          <div>
            <h3 className="font-bold text-white">Quiz Results</h3>
            <p className="text-xs text-primary-100/70">Arabic letter quiz</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <MiniStat label="Last" value={`${score.lastQuizScore}`} sub={`/${score.quizTotal}`} />
          <MiniStat label="Best" value={`${score.bestQuizScore}`} sub={`/${score.quizTotal}`} />
          <MiniStat label="Best %" value={`${bestPct}`} sub="%" />
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-white/70">
            <span>Last quiz score</span>
            <span>{quizPct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all"
              style={{ width: `${quizPct}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white">
          <Award size={14} className="text-gold-300" />
          {score.quizCompletion >= 1 ? 'Quiz completed at least once' : 'Quiz not completed yet'}
        </div>
      </div>

      {/* writing card */}
      <div className="screen-panel-dark liquid-panel relative mb-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#b77a27] to-[#d5a344] p-5 shadow-xl sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
            <PenTool size={24} />
          </span>
          <div>
            <h3 className="font-bold text-white">Writing Practice</h3>
            <p className="text-xs text-white/70">Letters traced</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <MiniStat label="Completed" value={`${score.writingCompleted}`} sub={`/ ${TOTAL_LETTERS}`} />
          <MiniStat label="Progress" value={`${writingPct}`} sub="%" />
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-white/70">
            <span>Writing progress</span>
            <span>{score.writingCompleted}/{TOTAL_LETTERS}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${writingPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* learn card */}
      <div className="screen-panel liquid-panel mb-4 flex items-center gap-3 rounded-[1.75rem] bg-[#fffdf8] p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white">
          <BookOpen size={24} />
        </span>
        <div className="flex-1">
          <h3 className="font-bold text-primary-900">Letters Available</h3>
          <p className="text-xs text-primary-900">{TOTAL_LETTERS} Arabic letters to learn</p>
        </div>
        <Percent size={20} className="text-primary-600" />
      </div>

      {/* actions */}
      <button
        onClick={() => {
          if (confirm('Reset all progress? This cannot be undone.')) onReset();
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-[#fffdf8] px-4 py-3 font-bold text-red-500 shadow-sm transition-all hover:bg-red-50 hover:shadow-md active:scale-95"
      >
        <RotateCcw size={18} /> Reset All Progress
      </button>

      <button
        onClick={onHome}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
      >
        <Home size={18} /> Home
      </button>
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-2 py-3 text-center ring-1 ring-white/15">
      <p className="text-xl font-bold text-white">
        {value}
        <span className="text-xs font-medium text-white/60">{sub}</span>
      </p>
      <p className="text-[10px] uppercase tracking-wide text-white/60">{label}</p>
    </div>
  );
}
