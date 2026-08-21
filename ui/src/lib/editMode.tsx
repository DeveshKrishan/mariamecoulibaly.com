import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from './auth';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type EditModeContextValue = {
  editMode: boolean;
  setEditMode: (on: boolean) => void;
  canEdit: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  runSave: <T>(work: () => Promise<T>) => Promise<T>;
};

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const { isAdmin, accessToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const wantEdit = searchParams.get('edit') === '1';
  const canEdit = Boolean(isAdmin && accessToken);
  const editMode = canEdit && wantEdit;

  const setEditMode = useCallback(
    (on: boolean) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (on) {
            next.set('edit', '1');
          } else {
            next.delete('edit');
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Drop ?edit=1 if the user is not an admin.
  useEffect(() => {
    if (wantEdit && !canEdit) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('edit');
          return next;
        },
        { replace: true },
      );
    }
  }, [wantEdit, canEdit, setSearchParams]);

  const runSave = useCallback(async <T,>(work: () => Promise<T>): Promise<T> => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      const result = await work();
      setSaveStatus('saved');
      window.setTimeout(() => {
        setSaveStatus((s) => (s === 'saved' ? 'idle' : s));
      }, 1500);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setSaveStatus('error');
      setSaveError(message);
      throw err;
    }
  }, []);

  const value = useMemo<EditModeContextValue>(
    () => ({
      editMode,
      setEditMode,
      canEdit,
      saveStatus,
      saveError,
      runSave,
    }),
    [editMode, setEditMode, canEdit, saveStatus, saveError, runSave],
  );

  return (
    <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
  );
}

export function useEditMode(): EditModeContextValue {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }
  return ctx;
}
