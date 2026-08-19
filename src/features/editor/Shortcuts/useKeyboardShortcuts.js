import { useEffect } from 'react';
import { useProjectStore } from '../../../app/store/useProjectStore.js';
import { useEditorUiStore } from '../../../app/store/useEditorUiStore.js';
import { toast } from '../../../app/store/useToastStore.js';

function isTypingTarget() {
  const tag = document.activeElement?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    function onKeyDown(e) {
      const isMeta = e.metaKey || e.ctrlKey;
      const projectState = useProjectStore.getState();
      const uiState = useEditorUiStore.getState();

      if (isTypingTarget()) {
        if (isMeta && e.key.toLowerCase() === 's') {
          e.preventDefault();
          projectState.saveCurrentProject();
          toast('Dashboard saved', 'success');
        }
        return;
      }

      if (isMeta && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        projectState.undo();
        return;
      }
      if ((isMeta && e.key.toLowerCase() === 'z' && e.shiftKey) || (isMeta && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        projectState.redo();
        return;
      }
      if (isMeta && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (uiState.selectedIds.length) {
          projectState.duplicateWidgets(uiState.selectedIds, { select: uiState.select });
        }
        return;
      }
      if (isMeta && e.key.toLowerCase() === 'c') {
        if (uiState.selectedIds.length) {
          const widgets = projectState.project.widgets.filter((w) => uiState.selectedIds.includes(w.id));
          uiState.setClipboard(widgets);
        }
        return;
      }
      if (isMeta && e.key.toLowerCase() === 'v') {
        const clipboard = uiState.clipboard;
        if (clipboard.length) {
          e.preventDefault();
          const offsetWidgets = clipboard.map((w) => ({ ...w, x: w.x + 32, y: w.y + 32 }));
          projectState.beginHistoryEntry();
          const withNewIds = offsetWidgets.map((w) => ({
            ...w,
            id: `w_${Math.random().toString(36).slice(2, 12)}`,
          }));
          projectState.addWidgetsBulk(withNewIds);
          uiState.select(withNewIds.map((w) => w.id));
        }
        return;
      }
      if (isMeta && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (projectState.project) uiState.select(projectState.project.widgets.map((w) => w.id));
        return;
      }
      if (isMeta && e.key.toLowerCase() === 's') {
        e.preventDefault();
        projectState.saveCurrentProject();
        toast('Dashboard saved', 'success');
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (uiState.selectedIds.length) {
          e.preventDefault();
          projectState.removeWidgets(uiState.selectedIds);
          uiState.clearSelection();
        }
        return;
      }
      if (e.key === 'Escape') {
        uiState.clearSelection();
        return;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (!uiState.selectedIds.length || !projectState.project) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        const patch = {};
        projectState.project.widgets.forEach((w) => {
          if (uiState.selectedIds.includes(w.id) && !w.locked) {
            patch[w.id] = { x: w.x + dx, y: w.y + dy };
          }
        });
        projectState.updateWidgetsBulk(patch);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
