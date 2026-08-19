import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { SlidersHorizontal, Layers as LayersIcon } from 'lucide-react';
import { useProjectStore } from '../../app/store/useProjectStore.js';
import { useEditorUiStore } from '../../app/store/useEditorUiStore.js';
import EditorToolbar from './Toolbar/EditorToolbar.jsx';
import WidgetLibraryPanel from './WidgetLibrary/WidgetLibraryPanel.jsx';
import InfiniteCanvas from './Canvas/InfiniteCanvas.jsx';
import WorkflowEditor from './Workflow/WorkflowEditor.jsx';
import PropertyInspector from './Inspector/PropertyInspector.jsx';
import LayerManager from './Layers/LayerManager.jsx';
import NLGeneratorModal from './NaturalLanguage/NLGeneratorModal.jsx';
import PreviewOverlay from './Preview/PreviewOverlay.jsx';
import { useKeyboardShortcuts } from './Shortcuts/useKeyboardShortcuts.js';
import { useAutosave } from './Autosave/useAutosave.js';

export default function EditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.projects);
  const project = useProjectStore((s) => s.project);
  const openProject = useProjectStore((s) => s.openProject);
  const closeProject = useProjectStore((s) => s.closeProject);
  const saveCurrentProject = useProjectStore((s) => s.saveCurrentProject);

  const activeRightPanel = useEditorUiStore((s) => s.activeRightPanel);
  const setActiveRightPanel = useEditorUiStore((s) => s.setActiveRightPanel);
  const clearSelection = useEditorUiStore((s) => s.clearSelection);

  const [tab, setTab] = useState('design');
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (projectId) openProject(projectId);
    return () => {
      closeProject();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    function handleBeforeUnload() {
      saveCurrentProject();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveCurrentProject]);

  useKeyboardShortcuts();
  useAutosave();

  useEffect(() => {
    if (projects.length && projectId && !projects.find((p) => p.id === projectId)) {
      navigate('/');
    }
  }, [projects, projectId, navigate]);

  function handleChangeTab(nextTab) {
    clearSelection();
    setTab(nextTab);
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen text-ink-muted text-sm">Loading dashboard…</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-surface-1">
      <EditorToolbar
        activeTab={tab}
        onChangeTab={handleChangeTab}
        onOpenGenerate={() => setGeneratorOpen(true)}
        onOpenPreview={() => setPreviewOpen(true)}
      />

      <div className="flex flex-1 min-h-0">
        {tab === 'design' ? (
          <>
            <div className="w-60 shrink-0 border-r border-surface-border bg-surface-0">
              <WidgetLibraryPanel />
            </div>
            <InfiniteCanvas />
            <div className="w-80 shrink-0 border-l border-surface-border bg-surface-0 flex flex-col">
              <div className="flex border-b border-surface-border shrink-0">
                <TabButton
                  icon={SlidersHorizontal}
                  label="Inspector"
                  active={activeRightPanel === 'inspector'}
                  onClick={() => setActiveRightPanel('inspector')}
                />
                <TabButton
                  icon={LayersIcon}
                  label="Layers"
                  active={activeRightPanel === 'layers'}
                  onClick={() => setActiveRightPanel('layers')}
                />
              </div>
              <div className="flex-1 min-h-0">{activeRightPanel === 'inspector' ? <PropertyInspector /> : <LayerManager />}</div>
            </div>
          </>
        ) : (
          <WorkflowEditor />
        )}
      </div>

      <NLGeneratorModal open={generatorOpen} onClose={() => setGeneratorOpen(false)} />
      {previewOpen ? <PreviewOverlay project={project} onClose={() => setPreviewOpen(false)} /> : null}
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors',
        active ? 'border-accent-600 text-accent-600' : 'border-transparent text-ink-muted hover:text-ink-primary'
      )}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
