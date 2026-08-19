import { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Layers } from 'lucide-react';
import { useProjectStore } from '../../../app/store/useProjectStore.js';
import { useEditorUiStore } from '../../../app/store/useEditorUiStore.js';
import { getWidgetDefinition } from '../WidgetLibrary/widgetDefinitions.js';

export default function LayerManager() {
  const project = useProjectStore((s) => s.project);
  const beginHistoryEntry = useProjectStore((s) => s.beginHistoryEntry);
  const updateWidgetsBulk = useProjectStore((s) => s.updateWidgetsBulk);
  const toggleWidgetLock = useProjectStore((s) => s.toggleWidgetLock);
  const toggleWidgetHidden = useProjectStore((s) => s.toggleWidgetHidden);

  const selectedIds = useEditorUiStore((s) => s.selectedIds);
  const select = useEditorUiStore((s) => s.select);
  const toggleSelect = useEditorUiStore((s) => s.toggleSelect);

  const [dragId, setDragId] = useState(null);

  if (!project) return null;
  if (!project.widgets.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
        <Layers size={26} className="text-ink-muted" />
        <p className="text-sm text-ink-secondary">Add widgets to the canvas to see them listed here.</p>
      </div>
    );
  }

  const layerOrder = [...project.widgets].sort((a, b) => b.zIndex - a.zIndex);

  function handleDrop(targetId) {
    if (!dragId || dragId === targetId) return;
    const order = [...layerOrder];
    const fromIndex = order.findIndex((w) => w.id === dragId);
    const toIndex = order.findIndex((w) => w.id === targetId);
    const [moved] = order.splice(fromIndex, 1);
    order.splice(toIndex, 0, moved);
    beginHistoryEntry();
    const total = order.length;
    const patch = {};
    order.forEach((w, i) => {
      patch[w.id] = { zIndex: total - i };
    });
    updateWidgetsBulk(patch, { transient: true });
    setDragId(null);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto py-2">
      <h2 className="px-4 pb-2 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Layers</h2>
      <ul className="flex flex-col px-2 gap-0.5">
        {layerOrder.map((widget) => {
          const def = getWidgetDefinition(widget.type);
          const Icon = def?.icon;
          const isSelected = selectedIds.includes(widget.id);
          return (
            <li
              key={widget.id}
              draggable
              onDragStart={() => setDragId(widget.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(widget.id)}
              onClick={(e) => (e.shiftKey ? toggleSelect(widget.id) : select(widget.id))}
              className={`group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors ${
                isSelected ? 'bg-accent-50 dark:bg-accent-500/15 text-accent-700 dark:text-accent-300' : 'hover:bg-surface-2 text-ink-secondary'
              }`}
            >
              {Icon ? <Icon size={15} className="shrink-0" /> : null}
              <span className="flex-1 truncate text-sm">{widget.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWidgetLock(widget.id);
                }}
                className="opacity-0 group-hover:opacity-100 data-[active=true]:opacity-100 text-ink-muted hover:text-ink-primary"
                data-active={widget.locked}
              >
                {widget.locked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWidgetHidden(widget.id);
                }}
                className="opacity-0 group-hover:opacity-100 data-[active=true]:opacity-100 text-ink-muted hover:text-ink-primary"
                data-active={widget.hidden}
              >
                {widget.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
