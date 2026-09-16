import { useState } from 'react';
import { BackHeader } from '@/components/BackHeader';
import { Clock3, LogOut, X } from 'lucide-react';
import { CLASS_THEMES } from '@/theme';
import { clearStoredUstadEmail, cancelPendingUstadRequest } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  theme: Theme;
  onBack: () => void | Promise<void>;
}

export function UstadPendingScreen({ theme, onBack }: Props) {
  const { logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const openConfirm = () => {
    setShowConfirm(true);
  };

  const closeConfirm = () => {
    if (!cancelling) {
      setShowConfirm(false);
    }
  };

  const confirmLogout = async () => {
    setCancelling(true);
    try {
      const email = clearStoredUstadEmail();
      if (email) {
        await cancelPendingUstadRequest(email);
      }
      await logout();
      setShowConfirm(false);
      await onBack();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="screen-shell mx-auto max-w-lg px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Request Pending" onBack={openConfirm} theme={theme} />

      <div className="rounded-[1.4rem] border border-primary-100 bg-white p-8 text-center shadow-sm">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: `${theme.accentSoft}` }}
        >
          <Clock3 size={32} style={{ color: theme.primary }} />
        </div>
        <h2 className="text-xl font-bold text-primary-900">Your Ustad request is pending</h2>
        <p className="mt-3 text-sm text-primary-700">
          Super Admin approval വരുന്നത് വരെ കാത്തിരിക്കുക.
        </p>
        <p className="mt-2 text-xs text-primary-600">
          You will get access once your request is approved.
        </p>
      </div>

      <button
        onClick={openConfirm}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-white px-6 py-3 text-sm font-bold text-primary-900 transition-all hover:bg-primary-50 active:scale-[0.98]"
      >
        <LogOut size={18} />
        Logout
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[1.4rem] border border-primary-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary-900">Logout?</h3>
              <button
                onClick={closeConfirm}
                className="rounded-full p-1 text-primary-600 hover:bg-primary-50"
                disabled={cancelling}
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-primary-700">
              If you logout, your pending request will be cancelled. You will not be able to receive approval for this request. You can register again later.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeConfirm}
                disabled={cancelling}
                className="rounded-xl border border-primary-200 px-4 py-2 text-xs font-bold text-primary-900 transition-all hover:bg-primary-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={cancelling}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-700 disabled:opacity-70"
              >
                {cancelling ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
