import { create } from 'zustand';
import { createId } from '../../lib/id.js';
import { loadProjects, saveProjects, loadAutosave, clearAutosave } from '../../lib/storage.js';
import { getWidgetDefinition } from '../../features/editor/WidgetLibrary/widgetDefinitions.js';

const MAX_HISTORY = 80;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function emptyWorkflow() {
  return { nodes: [], edges: [] };
}

function makeProjectShell(name) {
  const now = new Date().toISOString();
  return {
    id: createId('proj'),
    name: name || 'Untitled Dashboard',
    createdAt: now,
    updatedAt: now,
    widgets: [],
    workflow: emptyWorkflow(),
  };
}

function nextZIndex(widgets) {
  return widgets.reduce((max, w) => Math.max(max, w.zIndex || 0), 0) + 1;
}

export const useProjectStore = create((set, get) => ({
  projects: loadProjects(),
  project: null,
  past: [],
  future: [],
  isDirty: false,
  lastSavedAt: null,

  // ---------- Project lifecycle ----------

  refreshProjectsList() {
    set({ projects: loadProjects() });
  },

  createProject(name, seed = null) {
    const shell = makeProjectShell(name);
    if (seed) {
      shell.widgets = clone(seed.widgets || []);
      shell.workflow = seed.workflow ? clone(seed.workflow) : emptyWorkflow();
    }
    const projects = [shell, ...get().projects];
    saveProjects(projects);
    set({ projects, project: shell, past: [], future: [], isDirty: false, lastSavedAt: shell.updatedAt });
    return shell.id;
  },

  openProject(id) {
    const found = get().projects.find((p) => p.id === id);
    if (!found) return;
    const draft = loadAutosave(id);
    const project = draft && draft.updatedAt >= found.updatedAt ? draft : clone(found);
    set({
      project,
      past: [],
      future: [],
      isDirty: Boolean(draft && draft.updatedAt > found.updatedAt),
      lastSavedAt: found.updatedAt,
    });
  },

  closeProject() {
    set({ project: null, past: [], future: [] });
  },

  renameCurrentProject(name) {
    const { project } = get();
    if (!project) return;
    set({ project: { ...project, name: name || 'Untitled Dashboard' } });
    get().saveCurrentProject();
  },

  deleteProject(id) {
    const projects = get().projects.filter((p) => p.id !== id);
    saveProjects(projects);
    clearAutosave(id);
    set((state) => ({
      projects,
      project: state.project && state.project.id === id ? null : state.project,
    }));
  },

  duplicateCurrentAsNew(name) {
    const { project } = get();
    if (!project) return null;
    return get().createProject(name || `${project.name} copy`, project);
  },

  saveCurrentProject() {
    const { project, projects } = get();
    if (!project) return;
    const updated = { ...project, updatedAt: new Date().toISOString() };
    const idx = projects.findIndex((p) => p.id === updated.id);
    const nextProjects = idx >= 0
      ? projects.map((p) => (p.id === updated.id ? updated : p))
      : [updated, ...projects];
    saveProjects(nextProjects);
    clearAutosave(updated.id);
    set({ project: updated, projects: nextProjects, isDirty: false, lastSavedAt: updated.updatedAt });
  },

  markAutosaved() {
    set({ isDirty: false });
  },

  replaceCurrentProject(project) {
    set({ project, past: [], future: [], isDirty: true });
  },

  // ---------- History ----------

  beginHistoryEntry() {
    const { project, past } = get();
    if (!project) return;
    const snapshot = { widgets: clone(project.widgets), workflow: clone(project.workflow) };
    const nextPast = [...past, snapshot].slice(-MAX_HISTORY);
    set({ past: nextPast, future: [] });
  },

  undo() {
    const { past, future, project } = get();
    if (!past.length || !project) return;
    const previous = past[past.length - 1];
    const currentSnapshot = { widgets: clone(project.widgets), workflow: clone(project.workflow) };
    set({
      project: { ...project, widgets: previous.widgets, workflow: previous.workflow },
      past: past.slice(0, -1),
      future: [currentSnapshot, ...future].slice(0, MAX_HISTORY),
      isDirty: true,
    });
  },

  redo() {
    const { past, future, project } = get();
    if (!future.length || !project) return;
    const next = future[0];
    const currentSnapshot = { widgets: clone(project.widgets), workflow: clone(project.workflow) };
    set({
      project: { ...project, widgets: next.widgets, workflow: next.workflow },
      past: [...past, currentSnapshot].slice(-MAX_HISTORY),
      future: future.slice(1),
      isDirty: true,
    });
  },

  // ---------- Widgets ----------

  addWidget(type, position = {}, { select } = {}) {
    const def = getWidgetDefinition(type);
    if (!def || !get().project) return null;
    get().beginHistoryEntry();
    const widget = {
      id: createId('w'),
      type,
      name: def.label,
      x: position.x ?? 120,
      y: position.y ?? 120,
      width: def.defaultSize.width,
      height: def.defaultSize.height,
      rotation: 0,
      locked: false,
      hidden: false,
      zIndex: nextZIndex(get().project.widgets),
      props: def.createProps(),
    };
    set((state) => ({
      project: { ...state.project, widgets: [...state.project.widgets, widget] },
      isDirty: true,
    }));
    if (select) select(widget.id);
    return widget.id;
  },

  addWidgetsBulk(widgets, { replace = false } = {}) {
    if (!get().project) return;
    get().beginHistoryEntry();
    set((state) => ({
      project: {
        ...state.project,
        widgets: replace ? widgets : [...state.project.widgets, ...widgets],
      },
      isDirty: true,
    }));
  },

  updateWidget(id, patch, { transient = false } = {}) {
    if (!get().project) return;
    if (!transient) get().beginHistoryEntry();
    set((state) => ({
      project: {
        ...state.project,
        widgets: state.project.widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)),
      },
      isDirty: true,
    }));
  },

  updateWidgetProps(id, propsPatch, { transient = false } = {}) {
    if (!get().project) return;
    if (!transient) get().beginHistoryEntry();
    set((state) => ({
      project: {
        ...state.project,
        widgets: state.project.widgets.map((w) =>
          w.id === id ? { ...w, props: { ...w.props, ...propsPatch } } : w
        ),
      },
      isDirty: true,
    }));
  },

  updateWidgetsBulk(idToPatch, { transient = false } = {}) {
    if (!get().project) return;
    if (!transient) get().beginHistoryEntry();
    set((state) => ({
      project: {
        ...state.project,
        widgets: state.project.widgets.map((w) => (idToPatch[w.id] ? { ...w, ...idToPatch[w.id] } : w)),
      },
      isDirty: true,
    }));
  },

  removeWidgets(ids) {
    if (!get().project) return;
    get().beginHistoryEntry();
    const idSet = new Set(ids);
    set((state) => ({
      project: { ...state.project, widgets: state.project.widgets.filter((w) => !idSet.has(w.id)) },
      isDirty: true,
    }));
  },

  duplicateWidgets(ids, { select } = {}) {
    if (!get().project) return [];
    get().beginHistoryEntry();
    const idSet = new Set(ids);
    const source = get().project.widgets.filter((w) => idSet.has(w.id));
    let z = nextZIndex(get().project.widgets);
    const clones = source.map((w) => ({
      ...clone(w),
      id: createId('w'),
      name: `${w.name} copy`,
      x: w.x + 24,
      y: w.y + 24,
      zIndex: ++z,
    }));
    set((state) => ({
      project: { ...state.project, widgets: [...state.project.widgets, ...clones] },
      isDirty: true,
    }));
    if (select) select(clones.map((c) => c.id));
    return clones.map((c) => c.id);
  },

  reorderZIndex(ids, direction) {
    if (!get().project) return;
    get().beginHistoryEntry();
    set((state) => {
      const widgets = [...state.project.widgets].sort((a, b) => a.zIndex - b.zIndex);
      const idSet = new Set(ids);
      if (direction === 'front' || direction === 'back') {
        const selected = widgets.filter((w) => idSet.has(w.id));
        const rest = widgets.filter((w) => !idSet.has(w.id));
        const ordered = direction === 'front' ? [...rest, ...selected] : [...selected, ...rest];
        ordered.forEach((w, i) => (w.zIndex = i + 1));
        return { project: { ...state.project, widgets: ordered }, isDirty: true };
      }
      for (let i = 0; i < widgets.length; i += 1) {
        if (idSet.has(widgets[i].id)) {
          const swapWith = direction === 'forward' ? i + 1 : i - 1;
          if (swapWith >= 0 && swapWith < widgets.length && !idSet.has(widgets[swapWith].id)) {
            const tmp = widgets[i].zIndex;
            widgets[i].zIndex = widgets[swapWith].zIndex;
            widgets[swapWith].zIndex = tmp;
          }
        }
      }
      return { project: { ...state.project, widgets }, isDirty: true };
    });
  },

  toggleWidgetLock(id) {
    get().updateWidget(id, { locked: !get().project.widgets.find((w) => w.id === id)?.locked });
  },

  toggleWidgetHidden(id) {
    get().updateWidget(id, { hidden: !get().project.widgets.find((w) => w.id === id)?.hidden });
  },

  renameWidget(id, name) {
    get().updateWidget(id, { name });
  },

  // ---------- Workflow ----------

  setWorkflow(nodes, edges, { transient = false } = {}) {
    if (!get().project) return;
    if (!transient) get().beginHistoryEntry();
    set((state) => ({ project: { ...state.project, workflow: { nodes, edges } }, isDirty: true }));
  },
}));
