import { create } from 'zustand';

export const useEditorUiStore = create((set, get) => ({
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  clipboard: [],
  showGrid: true,
  snapToGrid: true,
  gridSize: 8,
  activeRightPanel: 'inspector',
  isPanning: false,
  marqueeRect: null,

  select(ids) {
    set({ selectedIds: Array.isArray(ids) ? ids : [ids].filter(Boolean) });
  },

  toggleSelect(id) {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((s) => s !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },

  addToSelection(ids) {
    const { selectedIds } = get();
    const merged = new Set([...selectedIds, ...ids]);
    set({ selectedIds: [...merged] });
  },

  clearSelection() {
    set({ selectedIds: [] });
  },

  setViewport(viewport) {
    set({ viewport });
  },

  panBy(dx, dy) {
    const { viewport } = get();
    set({ viewport: { ...viewport, x: viewport.x + dx, y: viewport.y + dy } });
  },

  zoomAt(factorDelta, screenPoint) {
    const { viewport } = get();
    const nextZoom = Math.min(2.5, Math.max(0.1, viewport.zoom * factorDelta));
    const worldBefore = {
      x: (screenPoint.x - viewport.x) / viewport.zoom,
      y: (screenPoint.y - viewport.y) / viewport.zoom,
    };
    const nextX = screenPoint.x - worldBefore.x * nextZoom;
    const nextY = screenPoint.y - worldBefore.y * nextZoom;
    set({ viewport: { x: nextX, y: nextY, zoom: nextZoom } });
  },

  setClipboard(widgets) {
    set({ clipboard: widgets });
  },

  setActiveRightPanel(panel) {
    set({ activeRightPanel: panel });
  },

  toggleShowGrid() {
    set({ showGrid: !get().showGrid });
  },

  toggleSnapToGrid() {
    set({ snapToGrid: !get().snapToGrid });
  },

  setIsPanning(isPanning) {
    set({ isPanning });
  },

  setMarqueeRect(rect) {
    set({ marqueeRect: rect });
  },
}));
