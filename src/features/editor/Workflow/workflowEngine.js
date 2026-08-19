import { ACTION_TYPES } from './workflowNodeDefinitions.js';

export function runWorkflowFrom(startNodeId, { nodes, edges }, context) {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const queue = [...edges.filter((e) => e.source === startNodeId).map((e) => e.target)];
  const visited = new Set();

  while (queue.length) {
    const nodeId = queue.shift();
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = nodeById.get(nodeId);
    if (node) {
      executeAction(node, context);
      const nextEdges = edges.filter((e) => e.source === nodeId).map((e) => e.target);
      queue.push(...nextEdges);
    }
  }
}

function executeAction(node, context) {
  const { nodeType, ...data } = node.data || {};
  switch (nodeType) {
    case ACTION_TYPES.SHOW_WIDGET:
      if (data.widgetId) context.updateWidget(data.widgetId, { hidden: false });
      break;
    case ACTION_TYPES.HIDE_WIDGET:
      if (data.widgetId) context.updateWidget(data.widgetId, { hidden: true });
      break;
    case ACTION_TYPES.TOGGLE_WIDGET:
      if (data.widgetId) context.toggleWidget(data.widgetId);
      break;
    case ACTION_TYPES.SET_TEXT:
      if (data.widgetId) context.updateWidgetProps(data.widgetId, { content: data.value ?? '' });
      break;
    case ACTION_TYPES.SHOW_ALERT:
      context.showAlert(data.message || '');
      break;
    default:
      break;
  }
}

export function findTriggerNodesByType(workflow, nodeType) {
  return workflow.nodes.filter((n) => n.data?.nodeType === nodeType);
}
