import { Handle, Position } from '@xyflow/react';
import clsx from 'clsx';
import { getNodeDefinition } from './workflowNodeDefinitions.js';

function NodeShell({ data, selected, kind, children }) {
  const def = getNodeDefinition(data.nodeType);
  const Icon = def?.icon;
  return (
    <div
      className={clsx(
        'min-w-[200px] rounded-xl border-2 bg-surface-0 shadow-panel px-3 py-2.5',
        selected ? 'border-accent-500' : 'border-surface-border',
        kind === 'trigger' ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-accent-500'
      )}
    >
      <div className="flex items-center gap-2">
        {Icon ? (
          <span
            className={clsx(
              'flex items-center justify-center w-6 h-6 rounded-md shrink-0',
              kind === 'trigger' ? 'bg-amber-100 text-amber-600' : 'bg-accent-100 text-accent-600'
            )}
          >
            <Icon size={14} />
          </span>
        ) : null}
        <span className="text-sm font-semibold text-ink-primary truncate">{def?.label}</span>
      </div>
      {children ? <div className="mt-1.5 text-xs text-ink-muted truncate">{children}</div> : null}
    </div>
  );
}

export function TriggerNode({ data, selected }) {
  return (
    <NodeShell kind="trigger" data={data} selected={selected}>
      {data.widgetName ? `Target: ${data.widgetName}` : null}
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white" />
    </NodeShell>
  );
}

export function ActionNode({ data, selected }) {
  return (
    <NodeShell kind="action" data={data} selected={selected}>
      {data.widgetName ? `Target: ${data.widgetName}` : data.message || data.value || null}
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-accent-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-accent-500 !border-2 !border-white" />
    </NodeShell>
  );
}
