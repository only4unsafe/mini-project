import { createId } from '../../../lib/id.js';
import { getWidgetDefinition, WIDGET_TYPES } from '../WidgetLibrary/widgetDefinitions.js';
import { findBestTemplateForKeywords } from '../../../lib/templates.js';

// A fully local, rule-based interpreter for turning a plain-English description
// into a dashboard. It never calls a network AI service — it works entirely by
// keyword matching, regular expressions and a deterministic auto-layout pass.
// If a project ever wires up a real AI API, that integration can replace (or
// augment) `interpret()` while keeping the same return shape.

const CHART_KEYWORDS = [
  { re: /\b(pie|donut)\b/i, kind: 'pie' },
  { re: /\b(line|trend)s?\b/i, kind: 'line' },
  { re: /\b(area)\b/i, kind: 'area' },
  { re: /\b(bar)s?\b/i, kind: 'bar' },
];

const WIDGET_KEYWORD_ORDER = [
  { type: WIDGET_TYPES.GAUGE, re: /\b(gauge|meter|dial)\b/i },
  { type: WIDGET_TYPES.KPI, re: /\b(kpi|metric|stat card|stat|scorecard|number card|counter)s?\b/i },
  { type: WIDGET_TYPES.CHART, re: /\b(chart|graph|bar|line|pie|donut|area)\b/i },
  { type: WIDGET_TYPES.TABLE, re: /\b(table|grid|list of|records?)\b/i },
  { type: WIDGET_TYPES.IMAGE, re: /\b(image|picture|photo|logo|banner)\b/i },
  { type: WIDGET_TYPES.BUTTON, re: /\b(button|cta|call[- ]to[- ]action)\b/i },
  { type: WIDGET_TYPES.SHAPE, re: /\b(shape|rectangle|box|divider|separator)\b/i },
  { type: WIDGET_TYPES.TEXT, re: /\b(title|heading|header|text|label)\b/i },
];

function titleCase(str) {
  return str
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function detectChartKind(clause) {
  for (const { re, kind } of CHART_KEYWORDS) {
    if (re.test(clause)) return kind;
  }
  return 'bar';
}

function detectWidgetType(clause) {
  for (const { type, re } of WIDGET_KEYWORD_ORDER) {
    if (re.test(clause)) return type;
  }
  return null;
}

function extractLabelList(clause) {
  const match = clause.match(/(?:for|showing|about|of)\s+(.+)$/i);
  const tail = match ? match[1] : '';
  if (!tail) return [];
  return tail
    .split(/,|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(titleCase);
}

function extractCount(clause) {
  const match = clause.match(/\b(\d+)\b/);
  return match ? parseInt(match[1], 10) : null;
}

function stripKeywords(clause) {
  return clause
    .replace(/\b(a|an|the|dashboard|widget|section|please|add|create|with|showing|include)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildWidgetFromClause(clause) {
  const type = detectWidgetType(clause);
  if (!type) return [];
  const def = getWidgetDefinition(type);
  const labels = extractLabelList(clause);
  const count = extractCount(clause);

  if (type === WIDGET_TYPES.KPI || type === WIDGET_TYPES.CHART) {
    const items = labels.length ? labels : count ? Array.from({ length: count }, (_, i) => `Metric ${i + 1}`) : [];
    if (items.length > 1) {
      return items.map((label) => makeWidget(type, def, clause, label));
    }
  }

  const fallbackLabel = labels[0] || titleCase(stripKeywords(clause)) || def.label;
  return [makeWidget(type, def, clause, fallbackLabel)];
}

function makeWidget(type, def, clause, label) {
  const props = def.createProps();
  if (type === WIDGET_TYPES.CHART) {
    props.chartKind = detectChartKind(clause);
    props.title = label;
  } else if (type === WIDGET_TYPES.KPI) {
    props.title = label;
  } else if (type === WIDGET_TYPES.TABLE) {
    props.title = label;
  } else if (type === WIDGET_TYPES.TEXT) {
    props.content = label;
    props.fontSize = /title|heading|header/i.test(clause) ? 30 : 18;
    props.fontWeight = /title|heading|header/i.test(clause) ? 800 : 500;
  } else if (type === WIDGET_TYPES.BUTTON) {
    props.label = label;
  } else if (type === WIDGET_TYPES.GAUGE) {
    props.title = label;
  }

  return {
    id: createId('w'),
    type,
    name: label && label !== def.label ? label : def.label,
    x: 0,
    y: 0,
    width: def.defaultSize.width,
    height: def.defaultSize.height,
    rotation: 0,
    locked: false,
    hidden: false,
    zIndex: 1,
    props,
  };
}

function splitIntoClauses(text) {
  return text
    .split(/\n|;|(?<=\.)\s+|\s+and\s+also\s+|,\s*and\s+|,/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function autoLayout(widgets, { originX = 60, originY = 60, canvasWidth = 1180, gap = 24 } = {}) {
  let cursorX = originX;
  let rowY = originY;
  let rowHeight = 0;
  let z = 1;

  return widgets.map((widget) => {
    if (cursorX + widget.width > originX + canvasWidth && cursorX !== originX) {
      cursorX = originX;
      rowY += rowHeight + gap;
      rowHeight = 0;
    }
    const placed = { ...widget, x: cursorX, y: rowY, zIndex: z };
    cursorX += widget.width + gap;
    rowHeight = Math.max(rowHeight, widget.height);
    z += 1;
    return placed;
  });
}

/**
 * Interpret free-form text and produce a ready-to-place widget list.
 * Strategy:
 *   1. Look for explicit widget requests clause-by-clause ("a bar chart for
 *      revenue", "3 kpi cards for users, orders and revenue", ...).
 *   2. If nothing explicit was found, fall back to the closest matching
 *      prebuilt template based on domain keywords (sales, marketing, etc).
 *   3. If neither matches, produce a small generic starter dashboard using
 *      whatever nouns were present in the prompt as a title.
 */
export function interpretPrompt(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return { widgets: [], source: 'empty' };
  }

  const clauses = splitIntoClauses(trimmed);
  const explicitWidgets = clauses.flatMap(buildWidgetFromClause);

  if (explicitWidgets.length >= 2) {
    return { widgets: autoLayout(explicitWidgets), source: 'explicit' };
  }

  const template = findBestTemplateForKeywords(trimmed);
  if (template) {
    const built = template.build();
    return { widgets: built.widgets, workflow: built.workflow, source: 'template', templateName: template.name };
  }

  if (explicitWidgets.length === 1) {
    return { widgets: autoLayout(explicitWidgets), source: 'explicit' };
  }

  const heading = {
    id: createId('w'),
    type: WIDGET_TYPES.TEXT,
    name: 'Heading',
    x: 0,
    y: 0,
    width: 560,
    height: 50,
    rotation: 0,
    locked: false,
    hidden: false,
    zIndex: 1,
    props: { content: titleCase(trimmed).slice(0, 60) || 'My Dashboard', fontSize: 28, fontWeight: 800, align: 'left', color: '#14151a' },
  };
  const kpiDef = getWidgetDefinition(WIDGET_TYPES.KPI);
  const chartDef = getWidgetDefinition(WIDGET_TYPES.CHART);
  const generic = [
    heading,
    makeWidget(WIDGET_TYPES.KPI, kpiDef, '', 'Key Metric'),
    makeWidget(WIDGET_TYPES.CHART, chartDef, '', 'Overview'),
  ];
  return { widgets: autoLayout(generic), source: 'generic' };
}
