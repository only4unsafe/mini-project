import { useNavigate } from 'react-router-dom';
import { LayoutTemplate } from 'lucide-react';
import Modal from '../../components/Modal.jsx';
import { DASHBOARD_TEMPLATES } from '../../lib/templates.js';
import { useProjectStore } from '../../app/store/useProjectStore.js';

export default function TemplateGallery({ open, onClose }) {
  const navigate = useNavigate();
  const createProject = useProjectStore((s) => s.createProject);

  function handlePick(template) {
    const built = template.build();
    const id = createProject(template.id === 'blank' ? 'Untitled Dashboard' : template.name, built);
    onClose();
    navigate(`/editor/${id}`);
  }

  return (
    <Modal open={open} onClose={onClose} title="Start a new dashboard" width={680}>
      <div className="grid grid-cols-2 gap-3">
        {DASHBOARD_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handlePick(template)}
            className="text-left rounded-xl border border-surface-border p-4 hover:border-accent-400 hover:bg-accent-50 dark:hover:bg-accent-500/10 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-accent-100 dark:bg-accent-500/20 text-accent-600 flex items-center justify-center mb-2.5">
              <LayoutTemplate size={18} />
            </div>
            <div className="text-sm font-semibold text-ink-primary">{template.name}</div>
            <div className="text-xs text-ink-muted mt-1 leading-relaxed">{template.description}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
