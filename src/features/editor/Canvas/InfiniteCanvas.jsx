import { useCallback, useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../../../app/store/useProjectStore.js';
import { useEditorUiStore } from '../../../app/store/useEditorUiStore.js';
import { getRotatedBounds } from '../../../lib/geometry.js';
import CanvasWidget from './CanvasWidget.jsx';
import SelectionOverlay from './SelectionOverlay.jsx';

function rectsIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export default function InfiniteCanvas() {
  const containerRef = useRef(null);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const panState = useRef(null);
  const marqueeState = useRef(null);
  const [editingTextId, setEditingTextId] = useState(null);

  const project = useProjectStore((s) => s.project);
  const addWidget = useProjectStore((s) => s.addWidget);

  const viewport = useEditorUiStore((s) => s.viewport);
  const setViewport = useEditorUiStore((s) => s.setViewport);
  const zoomAt = useEditorUiStore((s) => s.zoomAt);
  const panBy = useEditorUiStore((s) => s.panBy);
  const selectedIds = useEditorUiStore((s) => s.selectedIds);
  const select = useEditorUiStore((s) => s.select);
  const addToSelection = useEditorUiStore((s) => s.addToSelection);
  const clearSelection = useEditorUiStore((s) => s.clearSelection);
  const showGrid = useEditorUiStore((s) => s.showGrid);
  const setIsPanning = useEditorUiStore((s) => s.setIsPanning);
  const marqueeRect = useEditorUiStore((s) => s.marqueeRect);
  const setMarqueeRect = useEditorUiStore((s) => s.setMarqueeRect);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setIsSpaceDown(true);
      }
    }
    function onKeyUp(e) {
      if (e.code === 'Space') setIsSpaceDown(false);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const screenToWorld = useCallback(
    (clientX, clientY) => {
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - viewport.x) / viewport.zoom,
        y: (clientY - rect.top - viewport.y) / viewport.zoom,
      };
    },
    [viewport]
  );

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (e.ctrlKey || e.metaKey) {
        const factor = Math.exp(-e.deltaY * 0.01);
        zoomAt(factor, screenPoint);
      } else {
        panBy(-e.deltaX, -e.deltaY);
      }
    },
    [zoomAt, panBy]
  );

  const handlePointerDown = useCallback(
    (e) => {
      if (e.button === 1 || (e.button === 0 && isSpaceDown)) {
        panState.current = { startX: e.clientX, startY: e.clientY, originViewport: viewport };
        setIsPanning(true);
        e.preventDefault();
        return;
      }
      if (e.target !== e.currentTarget) return;
      const world = screenToWorld(e.clientX, e.clientY);
      marqueeState.current = { startWorld: world, additive: e.shiftKey };
      if (!e.shiftKey) clearSelection();
      setMarqueeRect({ x: world.x, y: world.y, width: 0, height: 0 });
    },
    [isSpaceDown, viewport, screenToWorld, clearSelection, setMarqueeRect, setIsPanning]
  );

  useEffect(() => {
    function onMove(e) {
      if (panState.current) {
        const dx = e.clientX - panState.current.startX;
        const dy = e.clientY - panState.current.startY;
        setViewport({ ...panState.current.originViewport, x: panState.current.originViewport.x + dx, y: panState.current.originViewport.y + dy });
        return;
      }
      if (marqueeState.current) {
        const world = screenToWorld(e.clientX, e.clientY);
        const start = marqueeState.current.startWorld;
        const rect = {
          x: Math.min(start.x, world.x),
          y: Math.min(start.y, world.y),
          width: Math.abs(world.x - start.x),
          height: Math.abs(world.y - start.y),
        };
        setMarqueeRect(rect);
      }
    }
    function onUp() {
      if (panState.current) {
        panState.current = null;
        setIsPanning(false);
      }
      if (marqueeState.current && project) {
        const rect = useEditorUiStore.getState().marqueeRect;
        if (rect && (rect.width > 4 || rect.height > 4)) {
          const hitIds = project.widgets
            .filter((w) => !w.hidden && rectsIntersect(getRotatedBounds(w), rect))
            .map((w) => w.id);
          if (marqueeState.current.additive) addToSelection(hitIds);
          else select(hitIds);
        }
        marqueeState.current = null;
        setMarqueeRect(null);
      }
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [screenToWorld, setViewport, project, addToSelection, select, setMarqueeRect, setIsPanning]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/pdc-widget-type');
      if (!type) return;
      const world = screenToWorld(e.clientX, e.clientY);
      addWidget(type, { x: world.x - 60, y: world.y - 30 }, { select });
    },
    [screenToWorld, addWidget, select]
  );

  if (!project) return null;

  const sortedWidgets = [...project.widgets].sort((a, b) => a.zIndex - b.zIndex);
  const cursorClass = isSpaceDown ? 'cursor-grab active:cursor-grabbing' : 'cursor-default';

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 overflow-hidden pdc-no-select ${cursorClass}`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={(e) => {
        if (e.target === containerRef.current) clearSelection();
      }}
    >
      <div
        className={showGrid ? 'pdc-canvas-surface absolute inset-0 origin-top-left' : 'absolute inset-0 origin-top-left'}
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          width: 6000,
          height: 6000,
          backgroundSize: showGrid ? '24px 24px' : undefined,
        }}
      >
        {sortedWidgets.map((widget) => (
          <CanvasWidget
            key={widget.id}
            widget={widget}
            isSelected={selectedIds.includes(widget.id)}
            isEditingText={editingTextId === widget.id}
            onStartEditText={() => setEditingTextId(widget.id)}
            onStopEditText={() => setEditingTextId(null)}
          />
        ))}
        <SelectionOverlay containerRef={containerRef} />
        {marqueeRect ? (
          <div
            className="absolute border border-accent-500 bg-accent-500/10 pointer-events-none rounded-sm"
            style={{ left: marqueeRect.x, top: marqueeRect.y, width: marqueeRect.width, height: marqueeRect.height }}
          />
        ) : null}
      </div>
    </div>
  );
}
