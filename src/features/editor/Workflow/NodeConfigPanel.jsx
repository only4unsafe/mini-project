import { Trash2 } from 'lucide-react';
import SelectField from '../../../components/fields/SelectField.jsx';
import TextField from '../../../components/fields/TextField.jsx';
import Button from '../../../components/Button.jsx';
import { getNodeDefinition, ACTION_TYPES } from './workflowNodeDefinitions.js';
import { WIDGET_TYPES } from '../WidgetLibrary/widgetDefinitions.js';

function widgetsForTarget(widgets, needsWidgetTarget) {
  if (needsWidgetTarget === 'button') return widgets.filter((w) => w.type === WIDGET_TYPES.BUTTON);
  if (needsWidgetTarget === 'text') return widgets.filter((w) => w.type === WIDGET_TYPES.TEXT);
  return widgets;
}

export default function NodeConfigPanel({ node, widgets, onChange, onDelete }) {
  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
        <p className="text-sm text-ink-secondary">
          Select a node to configure it, or add one from the palette on the left.
        </p>
      </div>
    );
  }

  const def = getNodeDefinition(node.data.nodeType);
  const matchingWidgets = widgetsForTarget(widgets, def?.needsWidgetTarget);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-surface-border">
        <h3 className="text-sm font-semibold text-ink-primary">{def?.label}</h3>
        <p className="text-xs text-ink-muted mt-1">{def?.description}</p>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {def?.needsWidgetTarget ? (
          <SelectField
            label="Target widget"
            value={node.data.widgetId || ''}
            onChange={(widgetId) => {
              const widget = widgets.find((w) => w.id === widgetId);
              onChange({ widgetId, widgetName: widget?.name || '' });
            }}
            options={[
              { value: '', label: 'Choose a widget…' },
              ...matchingWidgets.map((w) => ({ value: w.id, label: w.name })),
            ]}
          />
        ) : null}

        {node.data.nodeType === ACTION_TYPES.SET_TEXT ? (
          <TextField label="New text" value={node.data.value || ''} onChange={(value) => onChange({ value })} multiline />
        ) : null}

        {node.data.nodeType === ACTION_TYPES.SHOW_ALERT ? (
          <TextField label="Message" value={node.data.message || ''} onChange={(message) => onChange({ message })} multiline />
        ) : null}

        {!def?.needsWidgetTarget && node.data.nodeType !== ACTION_TYPES.SHOW_ALERT && node.data.nodeType !== ACTION_TYPES.SET_TEXT ? (
          <p className="text-xs text-ink-muted">This node needs no additional configuration.</p>
        ) : null}
      </div>

      <div className="p-4 border-t border-surface-border">
        <Button variant="danger" size="sm" icon={Trash2} onClick={onDelete} className="w-full">
          Delete node
        </Button>
      </div>
    </div>
  );
}
