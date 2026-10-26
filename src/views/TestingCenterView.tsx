import { useState } from 'react';
import { BackHeader } from '@/components/BackHeader';
import { CLASS_THEMES } from '@/theme';
import { User, Shield, Clock3, XCircle, GraduationCap, Monitor, Plus, Trash2, Pencil } from 'lucide-react';
import type { View } from '@/types';
import { useTestMode, type TestRole } from '@/contexts/TestModeContext';
import { StudentNamePrompt } from '@/components/StudentNamePrompt';
import { loadTestStudents, saveTestStudents, createTestStudent, deleteTestStudentData, type TestStudent } from '@/lib/testStudents';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

type TestRoleKey = TestRole;

interface RoleOption {
  key: TestRoleKey;
  title: string;
  description: string;
  icon: typeof User;
}

const ROLES: RoleOption[] = [
  {
    key: 'student',
    title: 'Student',
    description: 'Normal student interface with home, learn, quiz, writing, score, settings.',
    icon: User,
  },
  {
    key: 'ustad-approved',
    title: 'Approved Ustad',
    description: 'Normal student interface + Ustad Panel access.',
    icon: GraduationCap,
  },
  {
    key: 'ustad-pending',
    title: 'Pending Ustad',
    description: 'Restricted access: pending approval screen only.',
    icon: Clock3,
  },
  {
    key: 'ustad-rejected',
    title: 'Rejected Ustad',
    description: 'Restricted access: rejected screen with reason.',
    icon: XCircle,
  },
  {
    key: 'super-admin',
    title: 'Super Admin',
    description: 'Full Admin Panel access with all management features.',
    icon: Shield,
  },
];

export function TestingCenterView({ onNavigate, theme }: Props) {
  const { testRole, setTestRole, clearTestRole, simulatedStudentId, setSimulatedStudentId } = useTestMode();
  const [showNamePromptPreview, setShowNamePromptPreview] = useState(false);
  const [previewSubmittedName, setPreviewSubmittedName] = useState<string | null>(null);
  const [testStudents, setTestStudents] = useState<TestStudent[]>(() => loadTestStudents());
  const [newStudentName, setNewStudentName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const persist = (next: TestStudent[]) => {
    setTestStudents(next);
    saveTestStudents(next);
  };

  const handleAddStudent = () => {
    const trimmed = newStudentName.trim();
    if (!trimmed) return;
    const student = createTestStudent(trimmed);
    persist([...testStudents, student]);
    setNewStudentName('');
  };

  const handleRename = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    persist(testStudents.map((s) => (s.id === id ? { ...s, name: trimmed } : s)));
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this simulated student and their test data?')) return;
    deleteTestStudentData(id);
    persist(testStudents.filter((s) => s.id !== id));
    if (simulatedStudentId === id) setSimulatedStudentId(null);
  };

  const handleSelectRole = (role: TestRole) => {
    setTestRole(role);
    if (role === 'ustad-pending') {
      onNavigate('ustadPending');
    } else if (role === 'ustad-rejected') {
      onNavigate('ustadRejected');
    } else if (role === 'super-admin') {
      onNavigate('superAdmin');
    } else {
      onNavigate('home');
    }
  };
  return (
    <div className="screen-shell mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Testing Center" onBack={() => onNavigate('superAdmin')} theme={theme} />

      {testRole && (
        <div className="mb-6 rounded-[1.4rem] border border-yellow-200 bg-yellow-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor size={18} className="text-yellow-700" />
              <p className="text-sm font-bold text-yellow-900">TEST MODE ACTIVE</p>
            </div>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-800">
              {ROLES.find((r) => r.key === testRole)?.title || testRole}
            </span>
          </div>
          <p className="mt-2 text-xs text-yellow-800">
            You are previewing the app as a different role. This does not affect real accounts or data.
          </p>
          <button
            onClick={() => { clearTestRole(); setSimulatedStudentId(null); onNavigate('superAdmin'); }}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-yellow-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-yellow-700"
          >
            Exit Test Mode
          </button>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-bold text-primary-900">Select Test Role</h2>
        <p className="mt-1 text-xs text-primary-700">
          Choose a role to preview the app experience. Test mode does not modify real data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isActive = testRole === role.key;
          return (
            <button
              key={role.key}
              onClick={() => handleSelectRole(role.key)}
              className={`liquid-panel rounded-[1.4rem] p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isActive ? 'ring-2 ring-yellow-400' : ''
              }`}
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.surface,
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: theme.accentSoft }}
                >
                  <Icon size={24} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-primary-900">{role.title}</h3>
                    {isActive && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-800">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-primary-700">{role.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-[1.4rem] border border-slate-200 bg-slate-50/50 p-4">
        <h3 className="text-sm font-bold text-slate-900">Student Profile Form Preview</h3>
        <p className="mt-1 text-xs text-slate-700">
          Preview the actual student name entry form. Does not change your real role or account.
        </p>
        <button
          onClick={() => setShowNamePromptPreview(true)}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary-800"
        >
          Preview Student Profile Form
        </button>
        {previewSubmittedName && (
          <p className="mt-2 text-xs text-green-700">Last submitted (preview): {previewSubmittedName}</p>
        )}
      </div>

      {showNamePromptPreview && (
        <StudentNamePrompt
          onAccept={(name) => {
            setPreviewSubmittedName(name);
            setShowNamePromptPreview(false);
          }}
        />
      )}

      <div className="mt-6 rounded-[1.4rem] border border-slate-200 bg-slate-50/50 p-4">
        <h3 className="text-sm font-bold text-slate-900">Simulated Test Students</h3>
        <p className="mt-1 text-xs text-slate-700">
          Create isolated test students. Data is stored in a test-only namespace.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            placeholder="Student name"
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleAddStudent}
            className="inline-flex items-center gap-1 rounded-xl bg-primary-700 px-3 py-2 text-xs font-bold text-white"
          >
            <Plus size={14} /> Add
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {testStudents.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
              {editingId === s.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                />
              ) : (
                <span className="text-sm font-medium text-slate-800">{s.name}</span>
              )}
              <div className="flex gap-1">
                {editingId === s.id ? (
                  <button onClick={() => handleRename(s.id)} className="rounded-lg bg-green-600 px-2 py-1 text-xs font-bold text-white">Save</button>
                ) : (
                  <>
                    <button onClick={() => { setSimulatedStudentId(s.id); setTestRole('student'); onNavigate('home'); }} className="rounded-lg bg-blue-600 px-2 py-1 text-xs font-bold text-white">Use</button>
                    <button onClick={() => { setEditingId(s.id); setEditingName(s.name); }} className="rounded-lg bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700">
                      <Pencil size={12} />
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(s.id)} className="rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white">
                  <Trash2 size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-[1.4rem] border border-blue-200 bg-blue-50/50 p-4">
        <p className="text-sm font-bold text-blue-900">ℹ️ About Test Mode</p>
        <p className="mt-1 text-xs text-blue-800">
          Test Mode allows Super Admins to preview the app as different roles without modifying real accounts,
          roles, or Supabase data. All actions in Test Mode are isolated and do not affect production data.
        </p>
      </div>
    </div>
  );
}
