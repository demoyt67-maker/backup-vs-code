interface Props {
  name: string;
  onStart: () => void;
}

export function StudentWelcome({ name, onStart }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl ring-1 ring-slate-200">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Assalamu Alaikum, {name}!
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          Welcome to your Arabic learning journey.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-xl bg-primary-700 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
        >
          Start Learning
        </button>
      </div>
    </div>
  );
}
