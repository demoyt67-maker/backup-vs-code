import { useCallback, useState } from 'react';

const ACCOUNT_KEY = 'madrasa-teacher-account';
const SESSION_KEY = 'madrasa-teacher-session';

interface TeacherAccount {
  username: string;
  password: string;
}

function loadAccount(): TeacherAccount | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TeacherAccount;
  } catch {
    return null;
  }
}

function saveAccount(account: TeacherAccount) {
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    // ignore
  }
}

export function useTeacherAuth() {
  const [account, setAccount] = useState<TeacherAccount | null>(() => loadAccount());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const hasAccount = account !== null;

  const createAccount = useCallback((username: string, password: string): boolean => {
    const trimmed = username.trim();
    if (!trimmed || !password) return false;
    const acct = { username: trimmed, password };
    setAccount(acct);
    saveAccount(acct);
    return true;
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    if (!account) return false;
    if (username.trim() === account.username && password === account.password) {
      setIsLoggedIn(true);
      try {
        localStorage.setItem(SESSION_KEY, 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  }, [account]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  const updateCredentials = useCallback(
    (currentPassword: string, newUsername?: string, newPassword?: string): { success: boolean; error?: string } => {
      if (!account) return { success: false, error: 'No teacher account found.' };
      if (currentPassword !== account.password) {
        return { success: false, error: 'Current password is incorrect.' };
      }
      const updated: TeacherAccount = {
        username: newUsername?.trim() || account.username,
        password: newPassword || account.password,
      };
      setAccount(updated);
      saveAccount(updated);
      return { success: true };
    },
    [account],
  );

  return {
    isLoggedIn,
    hasAccount,
    username: account?.username ?? null,
    login,
    logout,
    createAccount,
    updateCredentials,
  };
}
