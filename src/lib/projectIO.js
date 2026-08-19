import { createId } from './id.js';

const SCHEMA_VERSION = 1;

export function downloadTextFile(filename, content, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function slugify(name) {
  return (name || 'dashboard')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'dashboard';
}

export function serializeProject(project) {
  const payload = {
    schema: 'professional-dashboard-creator',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    project: {
      name: project.name,
      widgets: project.widgets,
      workflow: project.workflow,
    },
  };
  return JSON.stringify(payload, null, 2);
}

export function exportProjectFile(project) {
  downloadTextFile(`${slugify(project.name)}.dashboard.json`, serializeProject(project), 'application/json');
}

class ProjectImportError extends Error {}

export function deserializeProject(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new ProjectImportError('This file is not valid JSON.');
  }

  const projectData = parsed && parsed.schema === 'professional-dashboard-creator' ? parsed.project : parsed;

  if (!projectData || typeof projectData !== 'object') {
    throw new ProjectImportError('This file does not contain a recognizable dashboard project.');
  }
  if (!Array.isArray(projectData.widgets)) {
    throw new ProjectImportError('This file is missing a widgets list.');
  }

  const now = new Date().toISOString();
  return {
    id: createId('proj'),
    name: typeof projectData.name === 'string' && projectData.name.trim() ? projectData.name : 'Imported Dashboard',
    createdAt: now,
    updatedAt: now,
    widgets: projectData.widgets.map((widget) => ({
      id: widget.id || createId('w'),
      type: widget.type,
      name: widget.name || widget.type,
      x: Number(widget.x) || 0,
      y: Number(widget.y) || 0,
      width: Number(widget.width) || 200,
      height: Number(widget.height) || 120,
      rotation: Number(widget.rotation) || 0,
      locked: Boolean(widget.locked),
      hidden: Boolean(widget.hidden),
      zIndex: Number(widget.zIndex) || 1,
      props: widget.props || {},
    })),
    workflow:
      projectData.workflow && Array.isArray(projectData.workflow.nodes) && Array.isArray(projectData.workflow.edges)
        ? projectData.workflow
        : { nodes: [], edges: [] },
  };
}

export { ProjectImportError };
