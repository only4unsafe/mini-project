import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Hash,
  Magnet,
  Sparkles,
  Download,
  Play,
  Sun,
  Moon,
  LayoutGrid,
  Workflow as WorkflowIcon,
  Check,
} from 'lucide-react';
import clsx from 'clsx';
import { useProjectStore } from '../../../app/store/useProjectStore.js';
import { useEditorUiStore } from '../../../app/store/useEditorUiStore.js';
import { useThemeStore } from '../../../app/store/useThemeStore.js';
import IconButton from '../../../components/IconButton.jsx';
import Button from '../../../components/Button.jsx';
import Modal from '../../../components/Modal.jsx';
import { exportProjectFile, downloadTextFile, slugify } from '../../../lib/projectIO.js';
import { buildStandaloneHtml } from '../../../lib/standaloneExport.js';
import { toast } from '../../../app/store/useToastStore.js';

export default function EditorToolbar({ activeTab, onChangeTab, onOpenGenerate, onOpenPreview }) {
  const navigate = useNavigate();
  const project = useProjectStore((s) => s.project);
  const isDirty = useProjectStore((s) => s.isDirty);
  const past = useProjectStore((s) => s.past);
  const future = useProjectStore((s) => s.future);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const saveCurrentProject = useProjectStore((s) => s.saveCurrentProject);
  const renameCurrentProject = useProjectStore((s) => s.renameCurrentProject);

  const viewport = useEditorUiStore((s) => s.viewport);
  const setViewport = useEditorUiStore((s) => s.setViewport);
  const showGrid = useEditorUiStore((s) => s.showGrid);
  const toggleShowGrid = useEditorUiStore((s) => s.toggleShowGrid);
  const snapToGrid = useEditorUiStore((s) => s.snapToGrid);
  const toggleSnapToGrid = useEditorUiStore((s) => s.toggleSnapToGrid);

  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const [nameDraft, setNameDraft] = useState(project?.name || '');
  const [exportOpen, setExportOpen] = useState(false);

  if (!project) return null;

  function zoomBy(factor) {
    const nextZoom = Math.min(2.5, Math.max(0.1, viewport.zoom * factor));
    setViewport({ ...viewport, zoom: nextZoom });
  }

  function resetZoom() {
    setViewport({ ...viewport, zoom: 1 });
  }

  function handleSave() {
    saveCurrentProject();
    toast('Dashboard saved', 'success');
  }

  return (
    <div className="h-14 shrink-0 border-b border-surface-border flex items-center px-3 gap-3 bg-surface-0">
      <IconButton icon={ArrowLeft} label="Back to projects" onClick={() => navigate('/')} />

      <input
        value={nameDraft}
        onChange={(e) => setNameDraft(e.target.value)}
        onBlur={() => nameDraft.trim() && renameCurrentProject(nameDraft.trim())}
        className="w-48 bg-transparent text-sm font-semibold text-ink-primary outline-none focus:bg-surface-2 rounded-md px-2 py-1"
      />

      <span className={clsx('text-xs flex items-center gap-1', isDirty ? 'text-ink-muted' : 'text-emerald-500')}>
        {isDirty ? 'Unsaved changes' : (
          <>
            <Check size={12} /> Saved
          </>
        )}
      </span>

      <div className="h-6 w-px bg-surface-border mx-1" />

      <IconButton icon={Undo2} label="Undo" onClick={undo} disabled={!past.length} />
      <IconButton icon={Redo2} label="Redo" onClick={redo} disabled={!future.length} />

      <div className="h-6 w-px bg-surface-border mx-1" />

      <div className="inline-flex rounded-lg border border-surface-border p-0.5">
        <button
          onClick={() => onChangeTab('design')}
          className={clsx(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            activeTab === 'design' ? 'bg-accent-600 text-white' : 'text-ink-secondary hover:bg-surface-2'
          )}
        >
          <LayoutGrid size={14} /> Design
        </button>
        <button
          onClick={() => onChangeTab('workflow')}
          className={clsx(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            activeTab === 'workflow' ? 'bg-accent-600 text-white' : 'text-ink-secondary hover:bg-surface-2'
          )}
        >
          <WorkflowIcon size={14} /> Workflow
        </button>
      </div>

      {activeTab === 'design' ? (
        <>
          <div className="h-6 w-px bg-surface-border mx-1" />
          <IconButton icon={ZoomOut} label="Zoom out" onClick={() => zoomBy(0.85)} />
          <button onClick={resetZoom} className="text-xs text-ink-secondary w-12 text-center hover:text-ink-primary">
            {Math.round(viewport.zoom * 100)}%
          </button>
          <IconButton icon={ZoomIn} label="Zoom in" onClick={() => zoomBy(1.15)} />
          <IconButton icon={Hash} label="Toggle grid" active={showGrid} onClick={toggleShowGrid} />
          <IconButton icon={Magnet} label="Toggle snap to grid" active={snapToGrid} onClick={toggleSnapToGrid} />
        </>
      ) : null}

      <div className="flex-1" />

      <Button variant="subtle" size="sm" icon={Sparkles} onClick={onOpenGenerate}>
        Generate
      </Button>
      <Button variant="subtle" size="sm" icon={Play} onClick={onOpenPreview}>
        Preview
      </Button>
      <Button variant="subtle" size="sm" icon={Download} onClick={() => setExportOpen(true)}>
        Export
      </Button>
      <Button size="sm" onClick={handleSave}>
        Save
      </Button>
      <IconButton icon={theme === 'dark' ? Sun : Moon} label="Toggle theme" onClick={toggleTheme} />

      <Modal open={exportOpen} onClose={() => setExportOpen(false)} title="Export dashboard" width={440}>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              exportProjectFile(project);
              toast('Exported project file', 'success');
              setExportOpen(false);
            }}
            className="text-left rounded-xl border border-surface-border p-3.5 hover:border-accent-400 hover:bg-accent-50 dark:hover:bg-accent-500/10"
          >
            <div className="text-sm font-semibold text-ink-primary">Project file (.json)</div>
            <div className="text-xs text-ink-muted mt-0.5">
              Re-import this file later to keep editing, or share it with someone else using this app.
            </div>
          </button>
          <button
            onClick={() => {
              const html = buildStandaloneHtml(project);
              downloadTextFile(`${slugify(project.name)}.html`, html, 'text/html');
              toast('Exported standalone application', 'success');
              setExportOpen(false);
            }}
            className="text-left rounded-xl border border-surface-border p-3.5 hover:border-accent-400 hover:bg-accent-50 dark:hover:bg-accent-500/10"
          >
            <div className="text-sm font-semibold text-ink-primary">Standalone app (.html)</div>
            <div className="text-xs text-ink-muted mt-0.5">
              A single self-contained file that runs your dashboard — including button behaviors — in any
              browser, with no install step.
            </div>
          </button>
        </div>
      </Modal>
    </div>
  );
}
