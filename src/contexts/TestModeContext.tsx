import { createContext, useContext } from 'react';

export type TestRole = 'student' | 'ustad-approved' | 'ustad-pending' | 'ustad-rejected' | 'super-admin' | null;

export interface TestModeContextValue {
  testRole: TestRole;
  setTestRole: (role: TestRole) => void;
  clearTestRole: () => void;
}

export const TestModeContext = createContext<TestModeContextValue | null>(null);

export function useTestMode() {
  const context = useContext(TestModeContext);
  if (!context) {
    return { testRole: null as TestRole, setTestRole: () => {}, clearTestRole: () => {} };
  }
  return context;
}
