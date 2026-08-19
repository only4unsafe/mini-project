import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, Upload, Copy, Trash2, Sun, Moon, Clock } from 'lucide-react';
import { useProjectStore } from '../../app/store/useProjectStore.js';
import { useThemeStore } from '../../app/store/useThemeStore.js';
import Button from '../../components/Button.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import TemplateGallery from './TemplateGallery.jsx';
import { deserializeProject, ProjectImportError } from '../../lib/projectIO.js';
import { toast } from '../../app/store/useToastStore.js';

function formatRelativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function HomePage() {
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.projects);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const createProject = useProjectStore((s) => s.createProject);
  const refreshProjectsList = useProjectStore((s) => s.refreshProjectsList);

  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const fileInputRef = useRef(null);

  const sortedProjects = [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  function handleDuplicate(project) {
    const id = createProject(`${project.name} copy`, project);
    refreshProjectsList();
    navigate(`/editor/${id}`);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = deserializeProject(String(reader.result));
        const id = createProject(imported.name, imported);
        toast('Project imported', 'success');
        navigate(`/editor/${id}`);
      } catch (err) {
        toast(err instanceof ProjectImportError ? err.message : 'Could not import this file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="min-h-screen bg-surface-1">
      <header className="border-b border-surface-border bg-surface-0">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-600 text-white flex items-center justify-center">
              <LayoutDashboard size={18} />
            </div>
            <span className="font-semibold text-ink-primary">Professional Dashboard Creator</span>
          </div>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-secondary hover:bg-surface-2"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink-primary">Your dashboards</h1>
            <p className="text-sm text-ink-secondary mt-1">Create, edit and export fully custom dashboards — no code required.</p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
            <Button variant="outline" icon={Upload} onClick={handleImportClick}>
              Import
            </Button>
            <Button icon={Plus} onClick={() => setGalleryOpen(true)}>
              New dashboard
            </Button>
          </div>
        </div>

        {sortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center border border-dashed border-surface-border rounded-2xl">
            <LayoutDashboard size={32} className="text-ink-muted" />
            <p className="text-sm text-ink-secondary">You don't have any dashboards yet.</p>
            <Button icon={Plus} onClick={() => setGalleryOpen(true)}>
              Create your first dashboard
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedProjects.map((project) => (
              <div
                key={project.id}
                className="group rounded-2xl border border-surface-border bg-surface-0 overflow-hidden hover:border-accent-400 transition-colors cursor-pointer"
                onClick={() => navigate(`/editor/${project.id}`)}
              >
                <div className="h-32 bg-surface-2 flex items-center justify-center relative overflow-hidden">
                  <MiniPreview widgets={project.widgets} />
                </div>
                <div className="p-3.5">
                  <div className="text-sm font-semibold text-ink-primary truncate">{project.name}</div>
                  <div className="text-xs text-ink-muted flex items-center gap-1 mt-1">
                    <Clock size={12} />
                    {formatRelativeTime(project.updatedAt)} · {project.widgets.length} widgets
                  </div>
                  <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(project);
                      }}
                      className="flex items-center gap-1 text-xs text-ink-secondary hover:text-accent-600"
                    >
                      <Copy size={13} /> Duplicate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(project);
                      }}
                      className="flex items-center gap-1 text-xs text-ink-secondary hover:text-red-600"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <TemplateGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteProject(pendingDelete.id)}
        title="Delete dashboard?"
        message={`"${pendingDelete?.name}" will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function MiniPreview({ widgets }) {
  if (!widgets.length) {
    return <LayoutDashboard size={28} className="text-ink-muted" />;
  }
  const maxX = Math.max(...widgets.map((w) => w.x + w.width), 100);
  const maxY = Math.max(...widgets.map((w) => w.y + w.height), 100);
  const scale = Math.min(220 / maxX, 110 / maxY);
  return (
    <div className="relative" style={{ width: maxX * scale, height: maxY * scale }}>
      {widgets.slice(0, 24).map((w) => (
        <div
          key={w.id}
          className="absolute rounded-sm bg-surface-3"
          style={{ left: w.x * scale, top: w.y * scale, width: w.width * scale, height: w.height * scale }}
        />
      ))}
    </div>
  );
}
