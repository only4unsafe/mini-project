import { useRef, useCallback } from 'react';
import clsx from 'clsx';
import { Lock } from 'lucide-react';
import { useProjectStore } from '../../../app/store/useProjectStore.js';
import { useEditorUiStore } from '../../../app/store/useEditorUiStore.js';
import { WIDGET_TYPES } from '../WidgetLibrary/widgetDefinitions.js';
import WidgetRenderer from '../widgets/WidgetRenderer.jsx';
import { toast } from '../../../app/store/useToastStore.js';

export default function CanvasWidget({ widget, isSelected, isEditingText, onStartEditText, onStopEditText }) {
  const dragState = useRef(null);
  const draftContent = useRef(widget.props.content);

  const project = useProjectStore((s) => s.project);
  const beginHistoryEntry = useProjectStore((s) => s.beginHistoryEntry);
  const updateWidgetsBulk = useProjectStore((s) => s.updateWidgetsBulk);
  const updateWidgetProps = useProjectStore((s) => s.updateWidgetProps);

  const viewport = useEditorUiStore((s) => s.viewport);
  const selectedIds = useEditorUiStore((s) => s.selectedIds);
  const select = useEditorUiStore((s) => s.select);
  const toggleSelect = useEditorUiStore((s) => s.toggleSelect);
  const snapToGrid = useEditorUiStore((s) => s.snapToGrid);
  const gridSize = useEditorUiStore((s) => s.gridSize);
  const isPanning = useEditorUiStore((s) => s.isPanning);

  const handlePointerDown = useCallback(
    (e) => {
      if (isEditingText || isPanning) return;
      if (e.button !== 0) return;
      e.stopPropagation();

      if (e.shiftKey) {
        toggleSelect(widget.id);
        return;
      }
      if (!selectedIds.includes(widget.id)) {
        select(widget.id);
      }
      if (widget.locked) return;

      const activeSelection = selectedIds.includes(widget.id) ? selectedIds : [widget.id];
      const startWidgets = project.widgets.filter((w) => activeSelection.includes(w.id) && !w.locked);
      if (!startWidgets.length) return;

      beginHistoryEntry();
      dragState.current = {
        startClientX: e.clientX,
        startClientY: e.clientY,
        origins: new Map(startWidgets.map((w) => [w.id, { x: w.x, y: w.y }])),
        moved: false,
      };

      function onMove(ev) {
        if (!dragState.current) return;
        const dx = (ev.clientX - dragState.current.startClientX) / viewport.zoom;
        const dy = (ev.clientY - dragState.current.startClientY) / viewport.zoom;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) dragState.current.moved = true;
        const patch = {};
        dragState.current.origins.forEach((origin, id) => {
          let nx = origin.x + dx;
          let ny = origin.y + dy;
          if (snapToGrid) {
            nx = Math.round(nx / gridSize) * gridSize;
            ny = Math.round(ny / gridSize) * gridSize;
          }
          patch[id] = { x: nx, y: ny };
        });
        updateWidgetsBulk(patch, { transient: true });
      }
      function onUp() {
        dragState.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [
      isEditingText,
      isPanning,
      selectedIds,
      widget.id,
      widget.locked,
      project,
      beginHistoryEntry,
      updateWidgetsBulk,
      viewport.zoom,
      snapToGrid,
      gridSize,
      select,
      toggleSelect,
    ]
  );

  const handleDoubleClick = useCallback(
    (e) => {
      if (widget.type !== WIDGET_TYPES.TEXT || widget.locked) return;
      e.stopPropagation();
      draftContent.current = widget.props.content;
      onStartEditText();
    },
    [widget.type, widget.locked, widget.props.content, onStartEditText]
  );

  function commitTextEdit() {
    if (draftContent.current !== widget.props.content) {
      updateWidgetProps(widget.id, { content: draftContent.current });
    }
    onStopEditText();
  }

  if (widget.hidden) return null;

  return (
    <div
      data-widget-id={widget.id}
      className={clsx('absolute', widget.locked ? 'cursor-not-allowed' : 'cursor-move')}
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        transform: `rotate(${widget.rotation || 0}deg)`,
        zIndex: widget.zIndex,
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      {isEditingText ? (
        <textarea
          autoFocus
          className="pdc-no-select w-full h-full resize-none bg-white/95 outline-none border-2 border-accent-500 rounded-md p-1"
          style={{
            fontSize: widget.props.fontSize,
            fontWeight: widget.props.fontWeight,
            color: widget.props.color,
            textAlign: widget.props.align || 'left',
          }}
          defaultValue={widget.props.content}
          onChange={(e) => {
            draftContent.current = e.target.value;
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onBlur={commitTextEdit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onStopEditText();
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              commitTextEdit();
            }
          }}
        />
      ) : (
        <div className="w-full h-full pointer-events-none">
          <div className="w-full h-full pointer-events-auto">
            <WidgetRenderer
              widget={widget}
              interactive={false}
              onActivateButton={() => toast('Buttons run their connected workflow in Preview mode.', 'default')}
            />
          </div>
        </div>
      )}
      {widget.locked ? (
        <div className="absolute -top-2 -right-2 bg-surface-0 border border-surface-border rounded-full p-1 shadow-panel">
          <Lock size={10} className="text-ink-muted" />
        </div>
      ) : null}
    </div>
  );
}
