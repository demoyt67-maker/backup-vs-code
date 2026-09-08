import { useState } from 'react';
import {
  Users, Trophy, PenTool, BookOpen, CheckCircle2, RotateCcw, Home,
  Lock, LogOut, Plus, Save, Trash2, Edit3, ChevronRight, GraduationCap, Sparkles, Moon, Wind, Settings, Languages,
} from 'lucide-react';
import { TOTAL_LETTERS } from '@/data/letters';
import { BackHeader } from '@/components/BackHeader';
import type { ScoreData } from '@/hooks/useScoreStore';
import type { useTeacherCurriculum } from '@/hooks/useTeacherCurriculum';
import {
  SET1_LEVELS, SET1_TITLE, SET1_TOTAL_LEVELS,
  SET2_LEVELS, SET2_TITLE, SET2_TOTAL_LEVELS,
  SET4_LEVELS, SET4_TITLE, SET4_TOTAL_LEVELS,
  SET5_LEVELS, SET5_TITLE, SET5_TOTAL_LEVELS,
  SET6_LEVELS, SET6_TITLE, SET6_TOTAL_LEVELS,
  type SetId,
} from '@/data/learningSets';
import { ARABIC_WORDS, CATEGORY_LABELS, type ArabicWord, type WordCategory } from '@/data/arabicWords';

type CurriculumApi = ReturnType<typeof useTeacherCurriculum>;

interface Props {
  onHome: () => void;
  score: ScoreData;
  onReset: () => void;
  isLoggedIn: boolean;
  hasAccount: boolean;
  username: string | null;
  onLogin: (username: string, password: string) => boolean;
  onLogout: () => void;
  onCreateAccount: (username: string, password: string) => boolean;
  onUpdateCredentials: (currentPassword: string, newUsername?: string, newPassword?: string) => { success: boolean; error?: string };
  curriculum: CurriculumApi;
  learningProgress: {
    learned: Set<number>;
    harakatLearned: Set<string>;
    sukoonLearned: Set<string>;
    tanweenLearned: Set<string>;
    wordsLearned: Set<string>;
  };
}

const SET_META: { id: SetId; title: string; totalLevels: number; icon: typeof BookOpen; levels: { level: number; title: string }[] }[] = [
  {
    id: 'set1', title: SET1_TITLE, totalLevels: SET1_TOTAL_LEVELS, icon: BookOpen,
    levels: SET1_LEVELS.map((l) => ({ level: l.level, title: `Letters ${l.letters.map((x) => x.arabic).join(' ')}` })),
  },
  {
    id: 'set2', title: SET2_TITLE, totalLevels: SET2_TOTAL_LEVELS, icon: Sparkles,
    levels: SET2_LEVELS.map((l) => ({ level: l.level, title: l.title })),
  },
  {
    id: 'set4', title: SET4_TITLE, totalLevels: SET4_TOTAL_LEVELS, icon: Moon,
    levels: SET4_LEVELS.map((l) => ({ level: l.level, title: l.title })),
  },
  {
    id: 'set5', title: SET5_TITLE, totalLevels: SET5_TOTAL_LEVELS, icon: Wind,
    levels: SET5_LEVELS.map((l) => ({ level: l.level, title: l.title })),
  },
  {
    id: 'set6', title: SET6_TITLE, totalLevels: SET6_TOTAL_LEVELS, icon: Languages,
    levels: SET6_LEVELS.map((l) => ({ level: l.level, title: l.title })),
  },
];

export function TeacherView({
  onHome, score, onReset, isLoggedIn, hasAccount, username,
  onLogin, onLogout, onCreateAccount, onUpdateCredentials, curriculum, learningProgress,
}: Props) {
  // No account yet → show account creation
  if (!hasAccount) {
    return <CreateAccount onHome={onHome} onCreateAccount={onCreateAccount} />;
  }

  // Account exists but not logged in → show login
  if (!isLoggedIn) {
    return <TeacherLogin onHome={onHome} onLogin={onLogin} />;
  }

  // Logged in → dashboard
  return (
    <TeacherDashboard
      onHome={onHome}
      score={score}
      onReset={onReset}
      onLogout={onLogout}
      username={username}
      onUpdateCredentials={onUpdateCredentials}
      curriculum={curriculum}
      learningProgress={learningProgress}
    />
  );
}

// ----- Create Account screen (first-time setup) -----

function CreateAccount({ onHome, onCreateAccount }: { onHome: () => void; onCreateAccount: (u: string, p: string) => boolean }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!onCreateAccount(username, password)) {
      setError('Could not create account. Please try again.');
      return;
    }
  };

  return (
    <div className="screen-shell mx-auto max-w-lg animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Teacher Mode" onBack={onHome} />

      <div className="screen-panel-dark overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#123f38] to-[#082b25] p-6 text-white shadow-2xl">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
            <GraduationCap size={30} className="text-white" />
          </span>
          <h3 className="text-lg font-bold text-white">Create Teacher Account</h3>
          <p className="text-xs text-primary-100/70">Set up your teacher credentials for first-time use</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-100/80">Create Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-gold-400"
              placeholder="Choose a username"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-100/80">Create Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-gold-400"
              placeholder="Choose a password"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-100/80">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-gold-400"
              placeholder="Re-enter password"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/20 px-3 py-2 text-center text-sm font-semibold text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-3 font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            <GraduationCap size={18} /> Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

// ----- Login screen -----

function TeacherLogin({ onHome, onLogin }: { onHome: () => void; onLogin: (u: string, p: string) => boolean }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(username, password)) {
      setError(true);
    }
  };

  return (
    <div className="screen-shell mx-auto max-w-lg animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Teacher Mode" onBack={onHome} />

      <div className="screen-panel-dark overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#123f38] to-[#082b25] p-6 text-white shadow-2xl">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
            <Lock size={30} className="text-white" />
          </span>
          <h3 className="text-lg font-bold text-white">Teacher Login</h3>
          <p className="text-xs text-primary-100/70">Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-100/80">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(false); }}
              className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-gold-400"
              placeholder="Enter username"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-100/80">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-gold-400"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/20 px-3 py-2 text-center text-sm font-semibold text-red-200">
              Invalid username or password
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-3 font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            <GraduationCap size={18} /> Login
          </button>
        </form>
      </div>
    </div>
  );
}

// ----- Account Settings screen -----

function AccountSettings({
  onBack,
  username,
  onUpdateCredentials,
}: {
  onBack: () => void;
  username: string | null;
  onUpdateCredentials: (currentPassword: string, newUsername?: string, newPassword?: string) => { success: boolean; error?: string };
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (!newUsername.trim() && !newPassword) {
      setError('Enter a new username or new password to make changes.');
      return;
    }

    const result = onUpdateCredentials(currentPassword, newUsername || undefined, newPassword || undefined);
    if (result.success) {
      setSuccess(true);
      setError('');
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error || 'Could not save changes.');
    }
  };

  return (
    <div className="screen-shell mx-auto max-w-lg animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Account Settings" onBack={onBack} subtitle="Update teacher credentials" />

      <div className="screen-panel-dark overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#123f38] to-[#082b25] p-6 text-white shadow-2xl">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
            <Settings size={28} className="text-white" />
          </span>
          <h3 className="text-lg font-bold text-white">Teacher Account Settings</h3>
          <p className="text-xs text-primary-100/70">
            Current username: <span className="font-bold text-gold-300">{username}</span>
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-100/80">Current Password (required)</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setError(''); setSuccess(false); }}
              className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-gold-400"
              placeholder="Enter current password"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-100/80">New Username (optional)</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => { setNewUsername(e.target.value); setError(''); setSuccess(false); }}
              className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-gold-400"
              placeholder="Leave blank to keep current"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-100/80">New Password (optional)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(''); setSuccess(false); }}
              className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-gold-400"
              placeholder="Leave blank to keep current"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-100/80">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); setSuccess(false); }}
              className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-gold-400"
              placeholder="Re-enter new password"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/20 px-3 py-2 text-center text-sm font-semibold text-red-200">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl bg-green-500/20 px-3 py-2 text-center text-sm font-semibold text-green-200">
              <CheckCircle2 size={14} className="mr-1 inline" /> Account updated successfully
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-3 font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            <Save size={18} /> Save Changes
          </button>
        </form>

        <button
          onClick={onBack}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 font-bold text-white ring-1 ring-white/20 transition-all hover:bg-white/15 active:scale-95"
        >
          <ChevronRight size={16} className="rotate-180" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// ----- Dashboard -----

function TeacherDashboard({
  onHome, score, onReset, onLogout, username, onUpdateCredentials, curriculum, learningProgress,
}: {
  onHome: () => void;
  score: ScoreData;
  onReset: () => void;
  onLogout: () => void;
  username: string | null;
  onUpdateCredentials: (currentPassword: string, newUsername?: string, newPassword?: string) => { success: boolean; error?: string };
  curriculum: CurriculumApi;
  learningProgress: Props['learningProgress'];
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSet, setSelectedSet] = useState<SetId | null>(null);
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [newLevelTitle, setNewLevelTitle] = useState('');
  const [newLevelContent, setNewLevelContent] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);

  const bestPct = Math.round((score.bestQuizScore / score.quizTotal) * 100) || 0;
  const lastPct = Math.round((score.lastQuizScore / score.quizTotal) * 100) || 0;
  const writingPct = Math.round((score.writingCompleted / TOTAL_LETTERS) * 100);

  const startEdit = (setId: SetId, level: number, currentTitle: string, currentContent: string) => {
    const key = `${setId}-${level}`;
    if (editingLevel === key) {
      setEditingLevel(null);
      return;
    }
    setEditingLevel(key);
    setEditTitle(currentTitle);
    setEditContent(currentContent);
    setShowAddLevel(false);
  };

  const handleSaveEdit = (setId: SetId, level: number) => {
    curriculum.editLevelTitle(setId, level, editTitle);
    curriculum.editLevelContent(setId, level, editContent);
    setEditingLevel(null);
    showSaved();
  };

  const handleAddLevel = (setId: SetId) => {
    if (!newLevelTitle.trim()) return;
    curriculum.addLevel(setId, newLevelTitle, newLevelContent);
    setNewLevelTitle('');
    setNewLevelContent('');
    setShowAddLevel(false);
    showSaved();
  };

  const showSaved = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  if (showSettings) {
    return (
      <AccountSettings
        onBack={() => setShowSettings(false)}
        username={username}
        onUpdateCredentials={onUpdateCredentials}
      />
    );
  }

  return (
    <div className="screen-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <div className="mb-4 flex items-center justify-between gap-2">
        <BackHeader title="Teacher Dashboard" onBack={onHome} subtitle="Manage curriculum & view progress" />
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#e4dcc9] bg-[#fffdf8] px-3 py-2 text-sm font-bold text-primary-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            <Settings size={16} /> Settings
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-[#fffdf8] px-3 py-2 text-sm font-bold text-red-500 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Student progress summary */}
      <div className="screen-panel-dark mb-4 flex items-center gap-3 rounded-[2rem] bg-gradient-to-br from-[#123f38] to-[#082b25] p-5 text-white shadow-2xl">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow">
          <Users size={28} />
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-bold">Student Progress</h3>
          <p className="text-xs text-primary-100/70">Overall learning summary</p>
        </div>
      </div>

      {/* Quiz + Writing cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="screen-panel rounded-[1.5rem] bg-[#fffdf8] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Trophy size={20} className="text-gold-600" />
            <h4 className="font-bold text-primary-900">Quiz</h4>
          </div>
          <Row label="Last" value={`${score.lastQuizScore}/${score.quizTotal}`} pct={lastPct} color="from-primary-500 to-teal-500" />
          <Row label="Best" value={`${score.bestQuizScore}/${score.quizTotal}`} pct={bestPct} color="from-gold-400 to-gold-600" />
        </div>
        <div className="screen-panel rounded-[1.5rem] bg-[#fffdf8] p-5">
          <div className="mb-3 flex items-center gap-2">
            <PenTool size={20} className="text-gold-600" />
            <h4 className="font-bold text-primary-900">Writing</h4>
          </div>
          <Row label="Traced" value={`${score.writingCompleted}/${TOTAL_LETTERS}`} pct={writingPct} color="from-gold-400 to-gold-600" />
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-gold-50 px-3 py-2 text-xs font-semibold text-gold-700">
            <CheckCircle2 size={14} />
            {score.writingCompleted >= TOTAL_LETTERS ? 'All letters completed' : `Next: #${Math.min(score.writingUnlocked, TOTAL_LETTERS)}`}
          </div>
        </div>
      </div>

      {/* Learning sets progress */}
      <div className="screen-panel mb-4 rounded-[1.5rem] bg-[#fffdf8] p-5">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen size={20} className="text-teal-600" />
          <h4 className="font-bold text-primary-900">Learning Sets Progress</h4>
        </div>
        <Row label="Set 1 — Letters" value={`${learningProgress.learned.size}/28`} pct={(learningProgress.learned.size / 28) * 100} color="from-primary-500 to-teal-500" />
        <Row label="Set 2 — Harakat" value={`${learningProgress.harakatLearned.size}`} pct={Math.min(100, (learningProgress.harakatLearned.size / 84) * 100)} color="from-gold-400 to-gold-600" />
        <Row label="Set 4 — Sukoon" value={`${learningProgress.sukoonLearned.size}`} pct={Math.min(100, (learningProgress.sukoonLearned.size / 28) * 100)} color="from-teal-400 to-teal-600" />
        <Row label="Set 5 — Tanween" value={`${learningProgress.tanweenLearned.size}`} pct={Math.min(100, (learningProgress.tanweenLearned.size / 28) * 100)} color="from-primary-400 to-teal-500" />
        <Row label="Set 6 — Words" value={`${learningProgress.wordsLearned.size}`} pct={Math.min(100, (learningProgress.wordsLearned.size / 36) * 100)} color="from-gold-400 to-primary-500" />
      </div>

      {/* Saved message */}
      {savedMsg && (
        <div className="mb-3 animate-fade-in rounded-2xl bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-700 ring-1 ring-green-200">
          <CheckCircle2 size={16} className="mr-1 inline" /> Changes saved successfully
        </div>
      )}

      {/* Curriculum management */}
      <div className="screen-panel mb-4 rounded-[1.5rem] bg-[#fffdf8] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Edit3 size={20} className="text-primary-600" />
          <h4 className="font-bold text-primary-900">Curriculum Management</h4>
        </div>

        {/* Set list */}
        <div className="space-y-2">
          {SET_META.map((set) => {
            const sd = curriculum.getSetData(set.id);
            const isExpanded = selectedSet === set.id;
            const Icon = set.icon;
            return (
              <div key={set.id} className="rounded-xl ring-1 ring-primary-50 transition-all">
                <button
                  onClick={() => setSelectedSet(isExpanded ? null : set.id)}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-primary-50/40 active:scale-[0.99]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-teal-600 text-white shadow-sm">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-primary-900">{set.title}</h5>
                    <p className="text-xs text-primary-500/70">{set.totalLevels} built-in levels{sd.addedLevels.length > 0 ? ` + ${sd.addedLevels.length} custom` : ''}</p>
                  </div>
                  <ChevronRight size={18} className={`shrink-0 text-primary-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Expanded: levels list with edit controls */}
                {isExpanded && (
                  <div className="animate-fade-in border-t border-primary-50 p-3">
                    {/* Built-in levels */}
                    {set.levels.map((lvl) => {
                      const custom = sd.editedLevels[String(lvl.level)];
                      const displayTitle = custom?.title || lvl.title;
                      const editKey = `${set.id}-${lvl.level}`;
                      const isEditing = editingLevel === editKey;
                      return (
                        <div key={lvl.level} className="mb-2 rounded-lg ring-1 ring-primary-50">
                          <div className="flex items-center justify-between gap-2 p-2.5">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-primary-800">Level {lvl.level}: {displayTitle}</p>
                              {custom?.content && <p className="mt-0.5 text-xs text-primary-500/70 line-clamp-2">{custom.content}</p>}
                            </div>
                            <button
                              onClick={() => startEdit(set.id, lvl.level, displayTitle, custom?.content || '')}
                              className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                                isEditing ? 'bg-gold-100 text-gold-700' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                              }`}
                            >
                              <Edit3 size={13} /> {isEditing ? 'Close' : 'Edit'}
                            </button>
                          </div>

                          {/* Edit form */}
                          {isEditing && (
                            <div className="animate-fade-in border-t border-primary-50 p-3">
                              <label className="mb-1 block text-xs font-semibold text-primary-600">Level Name</label>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="mb-2 w-full rounded-lg border-0 bg-primary-50/50 px-3 py-2 text-sm ring-1 ring-primary-100 outline-none focus:ring-2 focus:ring-primary-400"
                                placeholder="Level title"
                              />
                              <label className="mb-1 block text-xs font-semibold text-primary-600">Content / Notes</label>
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border-0 bg-primary-50/50 px-3 py-2 text-sm ring-1 ring-primary-100 outline-none focus:ring-2 focus:ring-primary-400"
                                placeholder="Add Arabic words, practice notes, or questions for this level..."
                              />
                              <button
                                onClick={() => handleSaveEdit(set.id, lvl.level)}
                                className="mt-2 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
                              >
                                <Save size={14} /> Save Changes
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Custom added levels */}
                    {sd.addedLevels.map((al, i) => (
                      <div key={`added-${i}`} className="mb-2 rounded-lg bg-gold-50 ring-1 ring-gold-100">
                        <div className="flex items-center justify-between gap-2 p-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gold-800">Custom Level {i + 1}: {al.title}</p>
                            {al.content && <p className="mt-0.5 text-xs text-gold-700/70 line-clamp-2">{al.content}</p>}
                          </div>
                          <button
                            onClick={() => curriculum.deleteAddedLevel(set.id, i)}
                            className="flex shrink-0 items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add level */}
                    {showAddLevel && selectedSet === set.id ? (
                      <div className="animate-fade-in rounded-lg bg-primary-50/50 p-3 ring-1 ring-primary-100">
                        <label className="mb-1 block text-xs font-semibold text-primary-600">New Level Name</label>
                        <input
                          type="text"
                          value={newLevelTitle}
                          onChange={(e) => setNewLevelTitle(e.target.value)}
                          className="mb-2 w-full rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-primary-100 outline-none focus:ring-2 focus:ring-primary-400"
                          placeholder="e.g. Extra Practice"
                          autoFocus
                        />
                        <label className="mb-1 block text-xs font-semibold text-primary-600">Content / Questions</label>
                        <textarea
                          value={newLevelContent}
                          onChange={(e) => setNewLevelContent(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-primary-100 outline-none focus:ring-2 focus:ring-primary-400"
                          placeholder="Add Arabic words, practice notes, or questions..."
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleAddLevel(set.id)}
                            disabled={!newLevelTitle.trim()}
                            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
                          >
                            <Save size={14} /> Save Level
                          </button>
                          <button
                            onClick={() => setShowAddLevel(false)}
                            className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-primary-600 ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setShowAddLevel(true); setEditingLevel(null); setNewLevelTitle(''); setNewLevelContent(''); }}
                        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-primary-200 px-4 py-2.5 text-sm font-bold text-primary-500 transition-all hover:border-primary-400 hover:bg-primary-50/30 active:scale-95"
                      >
                        <Plus size={16} /> Add New Level
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Arabic Word Management (Set 6) */}
      <div className="mb-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-primary-50">
        <div className="mb-4 flex items-center gap-2">
          <Languages size={20} className="text-gold-600" />
          <h4 className="font-bold text-primary-900">Arabic Word Management (Set 6)</h4>
        </div>
        <WordManagementSection />
      </div>

      {/* Reset */}
      <button
        onClick={() => { if (confirm('Reset all student progress?')) onReset(); }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-red-500 shadow-sm ring-1 ring-red-100 transition-all hover:bg-red-50 active:scale-95"
      >
        <RotateCcw size={18} /> Reset Student Progress
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

// ----- Word Management (Set 6 teacher controls) -----

const CUSTOM_WORDS_KEY = 'madrasa-teacher-custom-words';

interface CustomWord {
  id: string;
  arabic: string;
  malayalam: string;
  english: string;
  category: WordCategory;
}

function loadCustomWords(): CustomWord[] {
  try {
    const raw = localStorage.getItem(CUSTOM_WORDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomWord[];
  } catch {
    return [];
  }
}

function saveCustomWords(words: CustomWord[]) {
  try {
    localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(words));
  } catch {
    // ignore
  }
}

function WordManagementSection() {
  const [customWords, setCustomWords] = useState<CustomWord[]>(() => loadCustomWords());
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editArabic, setEditArabic] = useState('');
  const [editMalayalam, setEditMalayalam] = useState('');
  const [editEnglish, setEditEnglish] = useState('');
  const [editCategory, setEditCategory] = useState<WordCategory>('family');
  const [newArabic, setNewArabic] = useState('');
  const [newMalayalam, setNewMalayalam] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [newCategory, setNewCategory] = useState<WordCategory>('family');

  const allWords: CustomWord[] = [...ARABIC_WORDS, ...customWords];

  const persist = (words: CustomWord[]) => {
    setCustomWords(words);
    saveCustomWords(words);
  };

  const handleAdd = () => {
    if (!newArabic.trim() || !newMalayalam.trim() || !newEnglish.trim()) return;
    const word: CustomWord = {
      id: `cw-${Date.now()}`,
      arabic: newArabic.trim(),
      malayalam: newMalayalam.trim(),
      english: newEnglish.trim(),
      category: newCategory,
    };
    persist([...customWords, word]);
    setNewArabic('');
    setNewMalayalam('');
    setNewEnglish('');
    setNewCategory('family');
    setShowAdd(false);
  };

  const handleEdit = (word: CustomWord) => {
    if (editingId === word.id) {
      setEditingId(null);
      return;
    }
    setEditingId(word.id);
    setEditArabic(word.arabic);
    setEditMalayalam(word.malayalam);
    setEditEnglish(word.english);
    setEditCategory(word.category);
  };

  const handleSaveEdit = (word: CustomWord) => {
    const isCustom = customWords.some((w) => w.id === word.id);
    if (isCustom) {
      persist(customWords.map((w) =>
        w.id === word.id
          ? { ...w, arabic: editArabic.trim(), malayalam: editMalayalam.trim(), english: editEnglish.trim(), category: editCategory }
          : w,
      ));
    } else {
      // For built-in words, store an override
      const override: CustomWord = {
        id: word.id,
        arabic: editArabic.trim(),
        malayalam: editMalayalam.trim(),
        english: editEnglish.trim(),
        category: editCategory,
      };
      const existing = customWords.find((w) => w.id === word.id);
      if (existing) {
        persist(customWords.map((w) => (w.id === word.id ? override : w)));
      } else {
        persist([...customWords, override]);
      }
    }
    setEditingId(null);
  };

  const handleDelete = (wordId: string) => {
    persist(customWords.filter((w) => w.id !== wordId));
  };

  return (
    <div className="space-y-3">
      {/* Word list */}
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {allWords.map((word) => {
          const isCustom = customWords.some((w) => w.id === word.id);
          const isEditing = editingId === word.id;
          return (
            <div key={word.id} className="rounded-lg ring-1 ring-primary-50">
              <div className="flex items-center justify-between gap-2 p-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-arabic text-xl font-bold text-primary-800">{word.arabic}</span>
                    <span className="font-malayalam text-sm text-primary-600">{word.malayalam}</span>
                    <span className="text-xs text-primary-500/70">{word.english}</span>
                  </div>
                  <span className="mt-0.5 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-600">
                    {CATEGORY_LABELS[word.category].english}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => handleEdit(word)}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                      isEditing ? 'bg-gold-100 text-gold-700' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    }`}
                  >
                    <Edit3 size={12} /> {isEditing ? 'Close' : 'Edit'}
                  </button>
                  {isCustom && (
                    <button
                      onClick={() => handleDelete(word.id)}
                      className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1.5 text-xs font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="animate-fade-in border-t border-primary-50 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-primary-600">Arabic</label>
                      <input
                        type="text"
                        value={editArabic}
                        onChange={(e) => setEditArabic(e.target.value)}
                        className="w-full rounded-lg border-0 bg-primary-50/50 px-3 py-2 text-sm ring-1 ring-primary-100 outline-none focus:ring-2 focus:ring-primary-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-primary-600">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as WordCategory)}
                        className="w-full rounded-lg border-0 bg-primary-50/50 px-3 py-2 text-sm ring-1 ring-primary-100 outline-none focus:ring-2 focus:ring-primary-400"
                      >
                        {(Object.keys(CATEGORY_LABELS) as WordCategory[]).map((cat) => (
                          <option key={cat} value={cat}>{CATEGORY_LABELS[cat].english}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-primary-600">Malayalam</label>
                      <input
                        type="text"
                        value={editMalayalam}
                        onChange={(e) => setEditMalayalam(e.target.value)}
                        className="w-full rounded-lg border-0 bg-primary-50/50 px-3 py-2 text-sm ring-1 ring-primary-100 outline-none focus:ring-2 focus:ring-primary-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-primary-600">English</label>
                      <input
                        type="text"
                        value={editEnglish}
                        onChange={(e) => setEditEnglish(e.target.value)}
                        className="w-full rounded-lg border-0 bg-primary-50/50 px-3 py-2 text-sm ring-1 ring-primary-100 outline-none focus:ring-2 focus:ring-primary-400"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveEdit(word)}
                    className="mt-2 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
                  >
                    <Save size={14} /> Save Changes
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new word */}
      {showAdd ? (
        <div className="animate-fade-in rounded-lg bg-primary-50/50 p-3 ring-1 ring-primary-100">
          <h5 className="mb-2 text-sm font-bold text-primary-800">Add New Arabic Word</h5>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-600">Arabic Word</label>
              <input
                type="text"
                value={newArabic}
                onChange={(e) => setNewArabic(e.target.value)}
                className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-primary-100 outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="كتاب"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-600">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as WordCategory)}
                className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-primary-100 outline-none focus:ring-2 focus:ring-primary-400"
              >
                {(Object.keys(CATEGORY_LABELS) as WordCategory[]).map((cat) => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat].english}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-600">Malayalam Meaning</label>
              <input
                type="text"
                value={newMalayalam}
                onChange={(e) => setNewMalayalam(e.target.value)}
                className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-primary-100 outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="പുസ്തകം"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-600">English Meaning</label>
              <input
                type="text"
                value={newEnglish}
                onChange={(e) => setNewEnglish(e.target.value)}
                className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-primary-100 outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Book"
              />
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newArabic.trim() || !newMalayalam.trim() || !newEnglish.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              <Save size={14} /> Save Word
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-primary-600 ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setShowAdd(true); setEditingId(null); }}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-primary-200 px-4 py-2.5 text-sm font-bold text-primary-500 transition-all hover:border-primary-400 hover:bg-primary-50/30 active:scale-95"
        >
          <Plus size={16} /> Add New Word
        </button>
      )}
    </div>
  );
}

function Row({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-primary-700/80">{label}</span>
        <span className="font-bold text-primary-900">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-primary-100">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
