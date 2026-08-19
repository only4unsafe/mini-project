import { Lock, Unlock, Eye, EyeOff, Copy, Trash2, BringToFront, SendToBack, ChevronsUp, ChevronsDown, MousePointer2 } from 'lucide-react';
import { useProjectStore } from '../../../app/store/useProjectStore.js';
import { useEditorUiStore } from '../../../app/store/useEditorUiStore.js';
import NumberField from '../../../components/fields/NumberField.jsx';
import TextField from '../../../components/fields/TextField.jsx';
import IconButton from '../../../components/IconButton.jsx';
import WidgetPropsFields from './WidgetPropsFields.jsx';

export default function PropertyInspector() {
  const project = useProjectStore((s) => s.project);
  const updateWidget = useProjectStore((s) => s.updateWidget);
  const updateWidgetProps = useProjectStore((s) => s.updateWidgetProps);
  const renameWidget = useProjectStore((s) => s.renameWidget);
  const toggleWidgetLock = useProjectStore((s) => s.toggleWidgetLock);
  const toggleWidgetHidden = useProjectStore((s) => s.toggleWidgetHidden);
  const removeWidgets = useProjectStore((s) => s.removeWidgets);
  const duplicateWidgets = useProjectStore((s) => s.duplicateWidgets);
  const reorderZIndex = useProjectStore((s) => s.reorderZIndex);

  const selectedIds = useEditorUiStore((s) => s.selectedIds);
  const select = useEditorUiStore((s) => s.select);
  const clearSelection = useEditorUiStore((s) => s.clearSelection);

  if (!project) return null;

  const selectedWidgets = project.widgets.filter((w) => selectedIds.includes(w.id));

  if (!selectedWidgets.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
        <MousePointer2 size={26} className="text-ink-muted" />
        <p className="text-sm text-ink-secondary">Select a widget on the canvas to edit its properties.</p>
      </div>
    );
  }

  if (selectedWidgets.length > 1) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-primary">{selectedWidgets.length} widgets selected</span>
          <button className="text-xs text-accent-600 hover:underline" onClick={clearSelection}>
            Clear
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <IconButton icon={BringToFront} label="Bring to front" onClick={() => reorderZIndex(selectedIds, 'front')} />
          <IconButton icon={SendToBack} label="Send to back" onClick={() => reorderZIndex(selectedIds, 'back')} />
          <IconButton icon={Lock} label="Lock all" onClick={() => selectedIds.forEach((id) => updateWidget(id, { locked: true }, { transient: id !== selectedIds[0] }))} />
          <IconButton icon={EyeOff} label="Hide all" onClick={() => selectedIds.forEach((id) => updateWidget(id, { hidden: true }, { transient: id !== selectedIds[0] }))} />
        </div>
        <button
          className="flex items-center justify-center gap-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 h-9 text-sm font-medium"
          onClick={() => {
            removeWidgets(selectedIds);
            clearSelection();
          }}
        >
          <Trash2 size={16} />
          Delete selected
        </button>
      </div>
    );
  }

  const widget = selectedWidgets[0];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-surface-border">
        <TextField label="Name" value={widget.name} onChange={(v) => renameWidget(widget.id, v)} />
        <div className="grid grid-cols-4 gap-2 mt-3">
          <IconButton
            icon={widget.locked ? Unlock : Lock}
            label={widget.locked ? 'Unlock' : 'Lock'}
            active={widget.locked}
            onClick={() => toggleWidgetLock(widget.id)}
          />
          <IconButton
            icon={widget.hidden ? EyeOff : Eye}
            label={widget.hidden ? 'Show' : 'Hide'}
            active={widget.hidden}
            onClick={() => toggleWidgetHidden(widget.id)}
          />
          <IconButton icon={Copy} label="Duplicate" onClick={() => duplicateWidgets([widget.id], { select })} />
          <IconButton
            icon={Trash2}
            label="Delete"
            onClick={() => {
              removeWidgets([widget.id]);
              clearSelection();
            }}
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          <IconButton icon={BringToFront} label="Bring to front" onClick={() => reorderZIndex([widget.id], 'front')} />
          <IconButton icon={ChevronsUp} label="Bring forward" onClick={() => reorderZIndex([widget.id], 'forward')} />
          <IconButton icon={ChevronsDown} label="Send backward" onClick={() => reorderZIndex([widget.id], 'backward')} />
          <IconButton icon={SendToBack} label="Send to back" onClick={() => reorderZIndex([widget.id], 'back')} />
        </div>
      </div>

      <div className="p-4 border-b border-surface-border">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">Position &amp; Size</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <NumberField label="X" value={Math.round(widget.x)} onChange={(v) => updateWidget(widget.id, { x: v })} />
          <NumberField label="Y" value={Math.round(widget.y)} onChange={(v) => updateWidget(widget.id, { y: v })} />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <NumberField label="Width" value={Math.round(widget.width)} min={8} onChange={(v) => updateWidget(widget.id, { width: v })} />
          <NumberField label="Height" value={Math.round(widget.height)} min={8} onChange={(v) => updateWidget(widget.id, { height: v })} />
        </div>
        <NumberField
          label="Rotation"
          value={Math.round(widget.rotation || 0)}
          suffix="deg"
          onChange={(v) => updateWidget(widget.id, { rotation: v })}
        />
      </div>

      <div className="p-4">
        <WidgetPropsFields widget={widget} onChangeProps={(patch) => updateWidgetProps(widget.id, patch)} />
      </div>
    </div>
  );
}
