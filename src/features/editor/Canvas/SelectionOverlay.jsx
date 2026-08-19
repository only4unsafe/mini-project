import { useCallback, useRef } from 'react';
import { useProjectStore } from '../../../app/store/useProjectStore.js';
import { useEditorUiStore } from '../../../app/store/useEditorUiStore.js';
import { computeResize, computeRotation, snapRotation, unionBounds } from '../../../lib/geometry.js';

const HANDLES = [
  { hx: -1, hy: -1, cursor: 'nwse-resize' },
  { hx: 0, hy: -1, cursor: 'ns-resize' },
  { hx: 1, hy: -1, cursor: 'nesw-resize' },
  { hx: 1, hy: 0, cursor: 'ew-resize' },
  { hx: 1, hy: 1, cursor: 'nwse-resize' },
  { hx: 0, hy: 1, cursor: 'ns-resize' },
  { hx: -1, hy: 1, cursor: 'nesw-resize' },
  { hx: -1, hy: 0, cursor: 'ew-resize' },
];

export default function SelectionOverlay({ containerRef }) {
  const dragRef = useRef(null);
  const project = useProjectStore((s) => s.project);
  const beginHistoryEntry = useProjectStore((s) => s.beginHistoryEntry);
  const updateWidget = useProjectStore((s) => s.updateWidget);
  const selectedIds = useEditorUiStore((s) => s.selectedIds);
  const viewport = useEditorUiStore((s) => s.viewport);
  const snapToGrid = useEditorUiStore((s) => s.snapToGrid);
  const gridSize = useEditorUiStore((s) => s.gridSize);

  const screenToWorld = useCallback(
    (clientX, clientY) => {
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - viewport.x) / viewport.zoom,
        y: (clientY - rect.top - viewport.y) / viewport.zoom,
      };
    },
    [containerRef, viewport]
  );

  const startResize = useCallback(
    (handle, widget) => (e) => {
      e.stopPropagation();
      e.preventDefault();
      beginHistoryEntry();
      const originalBox = { x: widget.x, y: widget.y, width: widget.width, height: widget.height, rotation: widget.rotation || 0 };
      dragRef.current = { kind: 'resize' };

      function onMove(ev) {
        const mouseWorld = screenToWorld(ev.clientX, ev.clientY);
        const patch = computeResize(originalBox, handle, mouseWorld, {
          minWidth: 24,
          minHeight: 24,
          lockAspect: ev.shiftKey,
          gridSize: snapToGrid ? gridSize : 0,
        });
        updateWidget(widget.id, patch, { transient: true });
      }
      function onUp() {
        dragRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [beginHistoryEntry, screenToWorld, snapToGrid, gridSize, updateWidget]
  );

  const startRotate = useCallback(
    (widget) => (e) => {
      e.stopPropagation();
      e.preventDefault();
      beginHistoryEntry();
      const originalBox = { x: widget.x, y: widget.y, width: widget.width, height: widget.height, rotation: widget.rotation || 0 };

      function onMove(ev) {
        const mouseWorld = screenToWorld(ev.clientX, ev.clientY);
        let rotation = computeRotation(originalBox, mouseWorld);
        if (ev.shiftKey) rotation = snapRotation(rotation);
        updateWidget(widget.id, { rotation }, { transient: true });
      }
      function onUp() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [beginHistoryEntry, screenToWorld, updateWidget]
  );

  if (!project || !selectedIds.length) return null;

  const selectedWidgets = project.widgets.filter((w) => selectedIds.includes(w.id));
  if (!selectedWidgets.length) return null;

  if (selectedWidgets.length > 1) {
    const bounds = unionBounds(selectedWidgets);
    return (
      <div
        className="absolute pointer-events-none border-2 border-accent-500/70 rounded-sm"
        style={{ left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height }}
      />
    );
  }

  const widget = selectedWidgets[0];
  const handleSize = 10;

  return (
    <div
      className="absolute"
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        transform: `rotate(${widget.rotation || 0}deg)`,
      }}
    >
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
        <rect
          x={0}
          y={0}
          width={widget.width}
          height={widget.height}
          fill="none"
          stroke="#6366f1"
          strokeWidth={1.5}
          className="pdc-selection-outline"
        />
        {!widget.locked ? (
          <line
            x1={widget.width / 2}
            y1={0}
            x2={widget.width / 2}
            y2={-28}
            stroke="#6366f1"
            strokeWidth={1.5}
          />
        ) : null}
      </svg>

      {!widget.locked && (
        <div
          onPointerDown={startRotate(widget)}
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-accent-500 cursor-grab active:cursor-grabbing"
          style={{ left: widget.width / 2 - 8, top: -36 }}
        />
      )}

      {!widget.locked &&
        HANDLES.map(({ hx, hy, cursor }) => (
          <div
            key={`${hx}-${hy}`}
            onPointerDown={startResize({ hx, hy }, widget)}
            className="absolute bg-white border-2 border-accent-500 rounded-[3px]"
            style={{
              width: handleSize,
              height: handleSize,
              left: ((hx + 1) / 2) * widget.width - handleSize / 2,
              top: ((hy + 1) / 2) * widget.height - handleSize / 2,
              cursor,
            }}
          />
        ))}
    </div>
  );
}
