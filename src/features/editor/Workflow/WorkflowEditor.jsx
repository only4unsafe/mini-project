import { useCallback, useState, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Panel, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProjectStore } from '../../../app/store/useProjectStore.js';
import { createId } from '../../../lib/id.js';
import { WORKFLOW_NODE_DEFINITIONS, NODE_KIND } from './workflowNodeDefinitions.js';
import { TriggerNode, ActionNode } from './WorkflowNodes.jsx';
import NodeConfigPanel from './NodeConfigPanel.jsx';

const nodeTypes = { trigger: TriggerNode, action: ActionNode };

export default function WorkflowEditor() {
  const project = useProjectStore((s) => s.project);
  const setWorkflow = useProjectStore((s) => s.setWorkflow);
  const beginHistoryEntry = useProjectStore((s) => s.beginHistoryEntry);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [dragging, setDragging] = useState(false);

  const nodes = project?.workflow?.nodes || [];
  const edges = project?.workflow?.edges || [];

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const onNodesChange = useCallback(
    (changes) => {
      const isStructural = changes.some((c) => c.type === 'remove' || c.type === 'add');
      const next = applyNodeChanges(changes, nodes);
      setWorkflow(next, edges, { transient: !isStructural });
      if (changes.some((c) => c.type === 'remove')) setSelectedNodeId((id) => (nodes.find((n) => n.id === id) ? id : null));
    },
    [nodes, edges, setWorkflow]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      const isStructural = changes.some((c) => c.type === 'remove' || c.type === 'add');
      const next = applyEdgeChanges(changes, edges);
      setWorkflow(nodes, next, { transient: !isStructural });
    },
    [nodes, edges, setWorkflow]
  );

  const onConnect = useCallback(
    (connection) => {
      setWorkflow(nodes, addEdge({ ...connection, animated: true }, edges));
    },
    [nodes, edges, setWorkflow]
  );

  const onNodeDragStart = useCallback(() => {
    if (!dragging) {
      beginHistoryEntry();
      setDragging(true);
    }
  }, [dragging, beginHistoryEntry]);

  const onNodeDragStop = useCallback(() => setDragging(false), []);

  function addNode(def) {
    const index = nodes.length;
    const newNode = {
      id: createId('node'),
      type: def.kind,
      position: { x: 80 + (index % 4) * 60, y: 80 + Math.floor(index / 4) * 120 },
      data: { nodeType: def.nodeType, ...def.defaultData },
    };
    setWorkflow([...nodes, newNode], edges);
    setSelectedNodeId(newNode.id);
  }

  function updateSelectedNodeData(patch) {
    if (!selectedNodeId) return;
    setWorkflow(
      nodes.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, ...patch } } : n)),
      edges
    );
  }

  function deleteSelectedNode() {
    if (!selectedNodeId) return;
    setWorkflow(
      nodes.filter((n) => n.id !== selectedNodeId),
      edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
    );
    setSelectedNodeId(null);
  }

  if (!project) return null;

  const triggers = WORKFLOW_NODE_DEFINITIONS.filter((d) => d.kind === NODE_KIND.TRIGGER);
  const actions = WORKFLOW_NODE_DEFINITIONS.filter((d) => d.kind === NODE_KIND.ACTION);

  return (
    <div className="flex flex-1 min-h-0">
      <div className="w-56 shrink-0 border-r border-surface-border overflow-y-auto p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted px-1 pb-2">Triggers</h3>
        <div className="flex flex-col gap-1.5 mb-4">
          {triggers.map((def) => (
            <NodeButton key={def.nodeType} def={def} onClick={() => addNode(def)} />
          ))}
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted px-1 pb-2">Actions</h3>
        <div className="flex flex-col gap-1.5">
          {actions.map((def) => (
            <NodeButton key={def.nodeType} def={def} onClick={() => addNode(def)} />
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
        >
          <Background gap={20} />
          <Controls />
          <MiniMap pannable zoomable className="!bg-surface-0" />
          {!nodes.length ? (
            <Panel position="top-center">
              <div className="rounded-xl border border-surface-border bg-surface-0 shadow-panel px-4 py-2.5 text-sm text-ink-secondary">
                Add a trigger and an action from the left, then drag between their dots to connect them.
              </div>
            </Panel>
          ) : null}
        </ReactFlow>
      </div>

      <div className="w-72 shrink-0 border-l border-surface-border">
        <NodeConfigPanel node={selectedNode} widgets={project.widgets} onChange={updateSelectedNodeData} onDelete={deleteSelectedNode} />
      </div>
    </div>
  );
}

function NodeButton({ def, onClick }) {
  const Icon = def.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-0 px-2.5 py-2 text-left text-xs font-medium text-ink-secondary hover:border-accent-400 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-500/10 transition-colors"
    >
      <Icon size={15} />
      {def.label}
    </button>
  );
}
