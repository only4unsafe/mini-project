import { createId } from './id.js';
import { getWidgetDefinition, WIDGET_TYPES } from '../features/editor/WidgetLibrary/widgetDefinitions.js';

function w(type, box, propsOverride = {}, name) {
  const def = getWidgetDefinition(type);
  return {
    id: createId('w'),
    type,
    name: name || def.label,
    x: box.x,
    y: box.y,
    width: box.width ?? def.defaultSize.width,
    height: box.height ?? def.defaultSize.height,
    rotation: 0,
    locked: false,
    hidden: false,
    zIndex: box.z ?? 1,
    props: { ...def.createProps(), ...propsOverride },
  };
}

function heading(text, box) {
  return w(WIDGET_TYPES.TEXT, box, { content: text, fontSize: 28, fontWeight: 800 }, 'Heading');
}

function kpiRow(items, startX, y, z) {
  const width = 240;
  const gap = 24;
  return items.map((item, i) =>
    w(WIDGET_TYPES.KPI, { x: startX + i * (width + gap), y, width, height: 140, z: z + i }, item)
  );
}

export const DASHBOARD_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from nothing and build your own layout from scratch.',
    tags: ['blank'],
    build: () => ({ widgets: [], workflow: { nodes: [], edges: [] } }),
  },
  {
    id: 'sales-overview',
    name: 'Sales Overview',
    description: 'Revenue, deals and pipeline performance at a glance.',
    tags: ['sales', 'revenue', 'business'],
    build: () => ({
      widgets: [
        heading('Sales Overview', { x: 60, y: 40, width: 500, height: 50, z: 1 }),
        ...kpiRow(
          [
            { title: 'Total Revenue', value: '128,400', prefix: '$', delta: '+12.4%', trend: 'up', accentColor: '#6366f1' },
            { title: 'New Deals', value: '86', delta: '+4.1%', trend: 'up', accentColor: '#22c55e' },
            { title: 'Churn Rate', value: '2.3', suffix: '%', delta: '-0.4%', trend: 'down', accentColor: '#ef4444' },
          ],
          60,
          110,
          2
        ),
        w(
          WIDGET_TYPES.CHART,
          { x: 60, y: 280, width: 480, height: 300, z: 5 },
          { title: 'Monthly Revenue', chartKind: 'area', color: '#6366f1' }
        ),
        w(
          WIDGET_TYPES.CHART,
          { x: 560, y: 280, width: 380, height: 300, z: 6 },
          {
            title: 'Revenue by Channel',
            chartKind: 'pie',
            data: [
              { label: 'Direct', value: 42 },
              { label: 'Partner', value: 28 },
              { label: 'Online', value: 18 },
              { label: 'Referral', value: 12 },
            ],
          }
        ),
        w(
          WIDGET_TYPES.TABLE,
          { x: 60, y: 600, width: 880, height: 240, z: 7 },
          {
            title: 'Top Deals',
            columns: ['Account', 'Stage', 'Value'],
            rows: [
              ['Acme Corp', 'Negotiation', '$24,000'],
              ['Globex Inc', 'Closed Won', '$18,500'],
              ['Initech', 'Discovery', '$9,200'],
              ['Umbrella Co', 'Closed Won', '$31,000'],
            ],
          }
        ),
      ],
      workflow: { nodes: [], edges: [] },
    }),
  },
  {
    id: 'marketing-analytics',
    name: 'Marketing Analytics',
    description: 'Track campaigns, traffic sources and audience growth.',
    tags: ['marketing', 'analytics', 'growth'],
    build: () => ({
      widgets: [
        heading('Marketing Analytics', { x: 60, y: 40, width: 560, height: 50, z: 1 }),
        ...kpiRow(
          [
            { title: 'Website Visits', value: '48,230', delta: '+8.9%', trend: 'up', accentColor: '#6366f1' },
            { title: 'Conversion Rate', value: '3.8', suffix: '%', delta: '+0.6%', trend: 'up', accentColor: '#22c55e' },
            { title: 'Ad Spend', value: '6,420', prefix: '$', delta: '+2.1%', trend: 'up', accentColor: '#f59e0b' },
          ],
          60,
          110,
          2
        ),
        w(
          WIDGET_TYPES.CHART,
          { x: 60, y: 280, width: 500, height: 300, z: 5 },
          { title: 'Traffic Over Time', chartKind: 'line', color: '#22c55e' }
        ),
        w(
          WIDGET_TYPES.GAUGE,
          { x: 600, y: 280, width: 220, height: 200, z: 6 },
          { title: 'Campaign Goal', value: 68, unit: '%' }
        ),
        w(
          WIDGET_TYPES.CHART,
          { x: 860, y: 280, width: 300, height: 300, z: 7 },
          {
            title: 'Traffic Sources',
            chartKind: 'pie',
            data: [
              { label: 'Organic', value: 38 },
              { label: 'Paid', value: 24 },
              { label: 'Social', value: 22 },
              { label: 'Email', value: 16 },
            ],
          }
        ),
      ],
      workflow: { nodes: [], edges: [] },
    }),
  },
  {
    id: 'project-tracker',
    name: 'Project Tracker',
    description: 'Monitor tasks, sprint velocity and team workload.',
    tags: ['project management', 'tasks', 'team', 'productivity'],
    build: () => ({
      widgets: [
        heading('Project Tracker', { x: 60, y: 40, width: 500, height: 50, z: 1 }),
        ...kpiRow(
          [
            { title: 'Open Tasks', value: '34', delta: '-6', trend: 'down', accentColor: '#6366f1' },
            { title: 'Completed', value: '128', delta: '+18', trend: 'up', accentColor: '#22c55e' },
            { title: 'Overdue', value: '5', delta: '+2', trend: 'up', accentColor: '#ef4444' },
          ],
          60,
          110,
          2
        ),
        w(
          WIDGET_TYPES.CHART,
          { x: 60, y: 280, width: 480, height: 280, z: 5 },
          { title: 'Sprint Velocity', chartKind: 'bar', color: '#6366f1' }
        ),
        w(
          WIDGET_TYPES.TABLE,
          { x: 560, y: 280, width: 420, height: 280, z: 6 },
          {
            title: 'Task Board',
            columns: ['Task', 'Owner', 'Status'],
            rows: [
              ['Design review', 'Mia', 'In Progress'],
              ['API integration', 'Sam', 'Blocked'],
              ['QA pass', 'Alex', 'Todo'],
            ],
          }
        ),
        w(WIDGET_TYPES.BUTTON, { x: 60, y: 580, width: 180, height: 48, z: 7 }, { label: 'Add Task' }),
      ],
      workflow: { nodes: [], edges: [] },
    }),
  },
  {
    id: 'server-monitoring',
    name: 'Server Monitoring',
    description: 'CPU, memory and uptime health for your infrastructure.',
    tags: ['server', 'monitoring', 'infrastructure', 'devops', 'it'],
    build: () => ({
      widgets: [
        heading('Server Monitoring', { x: 60, y: 40, width: 520, height: 50, z: 1 }),
        w(WIDGET_TYPES.GAUGE, { x: 60, y: 110, width: 220, height: 200, z: 2 }, { title: 'CPU Load', value: 54, unit: '%' }),
        w(
          WIDGET_TYPES.GAUGE,
          { x: 300, y: 110, width: 220, height: 200, z: 3 },
          { title: 'Memory Usage', value: 71, unit: '%', color: '#f59e0b' }
        ),
        w(
          WIDGET_TYPES.KPI,
          { x: 540, y: 110, width: 240, height: 200, z: 4 },
          { title: 'Uptime', value: '99.98', suffix: '%', delta: '+0.02%', trend: 'up', accentColor: '#22c55e' }
        ),
        w(
          WIDGET_TYPES.CHART,
          { x: 60, y: 340, width: 720, height: 280, z: 5 },
          { title: 'Response Time (ms)', chartKind: 'line', color: '#ef4444' }
        ),
      ],
      workflow: { nodes: [], edges: [] },
    }),
  },
  {
    id: 'ecommerce-overview',
    name: 'E-commerce Overview',
    description: 'Orders, average order value and top products.',
    tags: ['ecommerce', 'shop', 'orders', 'retail'],
    build: () => ({
      widgets: [
        heading('E-commerce Overview', { x: 60, y: 40, width: 560, height: 50, z: 1 }),
        ...kpiRow(
          [
            { title: 'Orders Today', value: '312', delta: '+9.2%', trend: 'up', accentColor: '#6366f1' },
            { title: 'Avg. Order Value', value: '54.20', prefix: '$', delta: '+1.8%', trend: 'up', accentColor: '#22c55e' },
            { title: 'Returns', value: '12', delta: '-3', trend: 'down', accentColor: '#ef4444' },
          ],
          60,
          110,
          2
        ),
        w(
          WIDGET_TYPES.CHART,
          { x: 60, y: 280, width: 500, height: 300, z: 5 },
          { title: 'Orders This Week', chartKind: 'bar', color: '#6366f1' }
        ),
        w(
          WIDGET_TYPES.TABLE,
          { x: 600, y: 280, width: 400, height: 300, z: 6 },
          {
            title: 'Top Products',
            columns: ['Product', 'Units Sold', 'Revenue'],
            rows: [
              ['Wireless Mouse', '412', '$8,240'],
              ['Mechanical Keyboard', '298', '$14,900'],
              ['USB-C Hub', '187', '$4,675'],
            ],
          }
        ),
      ],
      workflow: { nodes: [], edges: [] },
    }),
  },
];

export function getTemplate(id) {
  return DASHBOARD_TEMPLATES.find((t) => t.id === id);
}

export function findBestTemplateForKeywords(text) {
  const lower = text.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const template of DASHBOARD_TEMPLATES) {
    if (template.id === 'blank') continue;
    const score = template.tags.reduce((acc, tag) => (lower.includes(tag) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      best = template;
    }
  }
  return bestScore > 0 ? best : null;
}
