import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import IconButton from '../../../components/IconButton.jsx';
import WidgetRenderer from '../widgets/WidgetRenderer.jsx';
import { unionBounds } from '../../../lib/geometry.js';
import { runWorkflowFrom } from '../Workflow/workflowEngine.js';
import { TRIGGER_TYPES } from '../Workflow/workflowNodeDefinitions.js';
import { toast } from '../../../app/store/useToastStore.js';

export default function PreviewOverlay({ project, onClose }) {
  const [widgets, setWidgets] = useState(() => project.widgets.map((w) => ({ ...w, props: { ...w.props } })));

  const context = useMemo(
    () => ({
      updateWidget(id, patch) {
        setWidgets((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));
      },
      updateWidgetProps(id, propsPatch) {
        setWidgets((ws) => ws.map((w) => (w.id === id ? { ...w, props: { ...w.props, ...propsPatch } } : w)));
      },
      toggleWidget(id) {
        setWidgets((ws) => ws.map((w) => (w.id === id ? { ...w, hidden: !w.hidden } : w)));
      },
      showAlert(message) {
        toast(message, 'default');
      },
    }),
    []
  );

  useEffect(() => {
    project.workflow.nodes
      .filter((n) => n.data?.nodeType === TRIGGER_TYPES.ON_LOAD)
      .forEach((n) => runWorkflowFrom(n.id, project.workflow, context));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleActivateButton(widgetId) {
    project.workflow.nodes
      .filter((n) => n.data?.nodeType === TRIGGER_TYPES.BUTTON_CLICK && n.data.widgetId === widgetId)
      .forEach((n) => runWorkflowFrom(n.id, project.workflow, context));
  }

  const bounds = unionBounds(widgets.length ? widgets : [{ x: 0, y: 0, width: 800, height: 400 }]);
  const sorted = [...widgets].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="fixed inset-0 z-[250] bg-surface-1 flex flex-col animate-fade-in">
      <div className="h-14 shrink-0 border-b border-surface-border flex items-center justify-between px-4 bg-surface-0">
        <div>
          <span className="text-sm font-semibold text-ink-primary">{project.name}</span>
          <span className="ml-2 text-xs text-ink-muted">Preview mode — buttons are live</span>
        </div>
        <IconButton icon={X} label="Close preview" onClick={onClose} />
      </div>
      <div className="flex-1 overflow-auto p-8">
        <div
          className="relative mx-auto pdc-canvas-surface rounded-2xl"
          style={{ width: bounds.x + bounds.width + 80, height: bounds.y + bounds.height + 80, backgroundSize: '24px 24px' }}
        >
          {sorted.map(
            (widget) =>
              !widget.hidden && (
                <div
                  key={widget.id}
                  className="absolute"
                  style={{
                    left: widget.x,
                    top: widget.y,
                    width: widget.width,
                    height: widget.height,
                    transform: `rotate(${widget.rotation || 0}deg)`,
                  }}
                >
                  <WidgetRenderer widget={widget} interactive onActivateButton={handleActivateButton} />
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
