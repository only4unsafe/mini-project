import { useEffect, useRef } from 'react';
import { useProjectStore } from '../../../app/store/useProjectStore.js';
import { saveAutosave } from '../../../lib/storage.js';

const AUTOSAVE_DELAY_MS = 1200;

export function useAutosave() {
  const project = useProjectStore((s) => s.project);
  const isDirty = useProjectStore((s) => s.isDirty);
  const markAutosaved = useProjectStore((s) => s.markAutosaved);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!project || !isDirty) return undefined;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveAutosave(project.id, { ...project, updatedAt: new Date().toISOString() });
      markAutosaved();
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timerRef.current);
  }, [project, isDirty, markAutosaved]);
}
