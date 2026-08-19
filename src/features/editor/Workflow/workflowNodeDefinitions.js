import { Zap, Rocket, Eye, EyeOff, ToggleLeft, Type, MessageCircle } from 'lucide-react';

export const NODE_KIND = { TRIGGER: 'trigger', ACTION: 'action' };

export const TRIGGER_TYPES = {
  BUTTON_CLICK: 'trigger.buttonClick',
  ON_LOAD: 'trigger.onLoad',
};

export const ACTION_TYPES = {
  SHOW_WIDGET: 'action.showWidget',
  HIDE_WIDGET: 'action.hideWidget',
  TOGGLE_WIDGET: 'action.toggleWidget',
  SET_TEXT: 'action.setText',
  SHOW_ALERT: 'action.showAlert',
};

export const WORKFLOW_NODE_DEFINITIONS = [
  {
    nodeType: TRIGGER_TYPES.BUTTON_CLICK,
    kind: NODE_KIND.TRIGGER,
    label: 'Button Clicked',
    icon: Zap,
    description: 'Fires when a chosen button widget is clicked in preview mode.',
    defaultData: { widgetId: null },
    needsWidgetTarget: 'button',
  },
  {
    nodeType: TRIGGER_TYPES.ON_LOAD,
    kind: NODE_KIND.TRIGGER,
    label: 'Dashboard Opened',
    icon: Rocket,
    description: 'Fires once when the dashboard preview first loads.',
    defaultData: {},
    needsWidgetTarget: null,
  },
  {
    nodeType: ACTION_TYPES.SHOW_WIDGET,
    kind: NODE_KIND.ACTION,
    label: 'Show Widget',
    icon: Eye,
    description: 'Makes a chosen widget visible.',
    defaultData: { widgetId: null },
    needsWidgetTarget: 'any',
  },
  {
    nodeType: ACTION_TYPES.HIDE_WIDGET,
    kind: NODE_KIND.ACTION,
    label: 'Hide Widget',
    icon: EyeOff,
    description: 'Hides a chosen widget.',
    defaultData: { widgetId: null },
    needsWidgetTarget: 'any',
  },
  {
    nodeType: ACTION_TYPES.TOGGLE_WIDGET,
    kind: NODE_KIND.ACTION,
    label: 'Toggle Widget',
    icon: ToggleLeft,
    description: 'Shows the widget if hidden, hides it if visible.',
    defaultData: { widgetId: null },
    needsWidgetTarget: 'any',
  },
  {
    nodeType: ACTION_TYPES.SET_TEXT,
    kind: NODE_KIND.ACTION,
    label: 'Set Text',
    icon: Type,
    description: 'Changes the content of a text widget.',
    defaultData: { widgetId: null, value: 'Updated text' },
    needsWidgetTarget: 'text',
  },
  {
    nodeType: ACTION_TYPES.SHOW_ALERT,
    kind: NODE_KIND.ACTION,
    label: 'Show Message',
    icon: MessageCircle,
    description: 'Displays a pop-up message in the preview.',
    defaultData: { message: 'Hello!' },
    needsWidgetTarget: null,
  },
];

export function getNodeDefinition(nodeType) {
  return WORKFLOW_NODE_DEFINITIONS.find((n) => n.nodeType === nodeType);
}
