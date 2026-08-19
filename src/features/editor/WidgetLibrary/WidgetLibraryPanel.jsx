import { WIDGET_LIBRARY } from './widgetDefinitions.js';
import { useProjectStore } from '../../../app/store/useProjectStore.js';
import { useEditorUiStore } from '../../../app/store/useEditorUiStore.js';

function groupByCategory(items) {
  const groups = {};
  items.forEach((item) => {
    groups[item.category] = groups[item.category] || [];
    groups[item.category].push(item);
  });
  return groups;
}

export default function WidgetLibraryPanel() {
  const addWidget = useProjectStore((s) => s.addWidget);
  const select = useEditorUiStore((s) => s.select);
  const viewport = useEditorUiStore((s) => s.viewport);
  const groups = groupByCategory(WIDGET_LIBRARY);

  function handleAddClick(type) {
    const centerWorld = {
      x: (window.innerWidth / 2 - 140 - viewport.x) / viewport.zoom,
      y: (window.innerHeight / 2 - 240 - viewport.y) / viewport.zoom,
    };
    addWidget(type, centerWorld, { select });
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-4">
      <h2 className="px-1 pb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Widgets</h2>
      {Object.entries(groups).map(([category, items]) => (
        <div key={category} className="mb-4">
          <h3 className="px-1 pb-2 text-[11px] font-semibold text-ink-muted">{category}</h3>
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/pdc-widget-type', item.type);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => handleAddClick(item.type)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-surface-border bg-surface-0 px-2 py-3 text-ink-secondary hover:border-accent-400 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-500/10 transition-colors cursor-grab active:cursor-grabbing"
                  title={`Add ${item.label}`}
                >
                  <Icon size={20} strokeWidth={1.8} />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="mt-auto px-1 pt-4 text-[11px] leading-relaxed text-ink-muted">
        Drag a widget onto the canvas, or click it to drop it in the center of your view.
      </p>
    </div>
  );
}
