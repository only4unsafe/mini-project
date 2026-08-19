const PROJECTS_KEY = 'pdc.projects.v1';
const THEME_KEY = 'pdc.theme.v1';
const AUTOSAVE_PREFIX = 'pdc.autosave.';

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Professional Dashboard Creator: failed to parse stored data', err);
    return fallback;
  }
}

export function loadProjects() {
  return safeParse(localStorage.getItem(PROJECTS_KEY), []);
}

export function saveProjects(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function loadTheme() {
  return safeParse(localStorage.getItem(THEME_KEY), 'light');
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
}

export function loadAutosave(projectId) {
  return safeParse(localStorage.getItem(AUTOSAVE_PREFIX + projectId), null);
}

export function saveAutosave(projectId, project) {
  localStorage.setItem(AUTOSAVE_PREFIX + projectId, JSON.stringify(project));
}

export function clearAutosave(projectId) {
  localStorage.removeItem(AUTOSAVE_PREFIX + projectId);
}
