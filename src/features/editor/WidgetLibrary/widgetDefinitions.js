import {
  Type,
  Gauge as GaugeIcon,
  BarChart3,
  Table2,
  ImageIcon,
  MousePointerClick,
  Square,
  TrendingUp,
} from 'lucide-react';

export const WIDGET_TYPES = {
  TEXT: 'text',
  KPI: 'kpi',
  CHART: 'chart',
  TABLE: 'table',
  IMAGE: 'image',
  BUTTON: 'button',
  SHAPE: 'shape',
  GAUGE: 'gauge',
};

const sampleSeries = [
  { label: 'Mon', value: 42 },
  { label: 'Tue', value: 58 },
  { label: 'Wed', value: 35 },
  { label: 'Thu', value: 71 },
  { label: 'Fri', value: 63 },
  { label: 'Sat', value: 49 },
  { label: 'Sun', value: 80 },
];

export const CHART_KINDS = ['bar', 'line', 'area', 'pie'];

export const WIDGET_LIBRARY = [
  {
    type: WIDGET_TYPES.TEXT,
    label: 'Text',
    icon: Type,
    category: 'Basics',
    defaultSize: { width: 260, height: 70 },
    createProps: () => ({
      content: 'Double-click to edit this text',
      fontSize: 22,
      fontWeight: 700,
      align: 'left',
      color: '#14151a',
    }),
  },
  {
    type: WIDGET_TYPES.KPI,
    label: 'KPI Card',
    icon: TrendingUp,
    category: 'Data',
    defaultSize: { width: 240, height: 140 },
    createProps: () => ({
      title: 'Total Revenue',
      value: '128,400',
      prefix: '$',
      suffix: '',
      delta: '+12.4%',
      trend: 'up',
      accentColor: '#6366f1',
    }),
  },
  {
    type: WIDGET_TYPES.CHART,
    label: 'Chart',
    icon: BarChart3,
    category: 'Data',
    defaultSize: { width: 420, height: 280 },
    createProps: () => ({
      title: 'Weekly Performance',
      chartKind: 'bar',
      color: '#6366f1',
      showGrid: true,
      showLegend: false,
      data: sampleSeries,
    }),
  },
  {
    type: WIDGET_TYPES.TABLE,
    label: 'Table',
    icon: Table2,
    category: 'Data',
    defaultSize: { width: 420, height: 240 },
    createProps: () => ({
      title: 'Recent Records',
      columns: ['Name', 'Status', 'Amount'],
      rows: [
        ['Acme Corp', 'Active', '$4,200'],
        ['Globex Inc', 'Pending', '$1,050'],
        ['Initech', 'Active', '$8,760'],
      ],
    }),
  },
  {
    type: WIDGET_TYPES.IMAGE,
    label: 'Image',
    icon: ImageIcon,
    category: 'Basics',
    defaultSize: { width: 280, height: 200 },
    createProps: () => ({
      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=60',
      alt: 'Placeholder image',
      objectFit: 'cover',
      radius: 12,
    }),
  },
  {
    type: WIDGET_TYPES.BUTTON,
    label: 'Button',
    icon: MousePointerClick,
    category: 'Basics',
    defaultSize: { width: 160, height: 48 },
    createProps: () => ({
      label: 'Click me',
      variant: 'solid',
      color: '#6366f1',
      eventName: 'onClick',
    }),
  },
  {
    type: WIDGET_TYPES.SHAPE,
    label: 'Shape',
    icon: Square,
    category: 'Basics',
    defaultSize: { width: 160, height: 160 },
    createProps: () => ({
      shapeKind: 'rectangle',
      fill: '#e0e7ff',
      stroke: '#6366f1',
      strokeWidth: 2,
      radius: 12,
    }),
  },
  {
    type: WIDGET_TYPES.GAUGE,
    label: 'Gauge',
    icon: GaugeIcon,
    category: 'Data',
    defaultSize: { width: 220, height: 200 },
    createProps: () => ({
      title: 'Capacity',
      value: 72,
      min: 0,
      max: 100,
      color: '#6366f1',
      unit: '%',
    }),
  },
];

export function getWidgetDefinition(type) {
  return WIDGET_LIBRARY.find((w) => w.type === type);
}
