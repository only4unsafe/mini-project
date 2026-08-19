import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import Modal from '../../../components/Modal.jsx';
import Button from '../../../components/Button.jsx';
import TextField from '../../../components/fields/TextField.jsx';
import SegmentedField from '../../../components/fields/SegmentedField.jsx';
import { interpretPrompt } from './nlEngine.js';
import { useProjectStore } from '../../../app/store/useProjectStore.js';
import { useEditorUiStore } from '../../../app/store/useEditorUiStore.js';
import { toast } from '../../../app/store/useToastStore.js';

const EXAMPLES = [
  'A sales dashboard with revenue, new deals and churn rate KPIs, plus a monthly revenue chart',
  '3 KPI cards for signups, active users and revenue, a line chart of growth, and a table of recent signups',
  'Server monitoring dashboard with CPU and memory gauges',
  'A heading that says Marketing Report, a pie chart for traffic sources, a button labeled Refresh',
];

export default function NLGeneratorModal({ open, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('append');
  const project = useProjectStore((s) => s.project);
  const addWidgetsBulk = useProjectStore((s) => s.addWidgetsBulk);
  const setWorkflow = useProjectStore((s) => s.setWorkflow);
  const select = useEditorUiStore((s) => s.select);

  const hasExistingWidgets = Boolean(project?.widgets?.length);

  function handleGenerate() {
    const result = interpretPrompt(prompt);
    if (!result.widgets.length) {
      toast('Describe what you want on the dashboard first.', 'error');
      return;
    }
    const replace = mode === 'replace' || !hasExistingWidgets;
    addWidgetsBulk(result.widgets, { replace });
    if (result.workflow && replace) {
      setWorkflow(result.workflow.nodes, result.workflow.edges);
    }
    select(result.widgets.map((w) => w.id));
    const message =
      result.source === 'template'
        ? `Generated a "${result.templateName}" layout from your description`
        : 'Generated widgets from your description';
    toast(message, 'success');
    setPrompt('');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Generate a dashboard from text" width={560}>
      <div className="flex flex-col gap-4">
        <TextField
          label="Describe the dashboard you want"
          value={prompt}
          onChange={setPrompt}
          multiline
          rows={4}
          placeholder="e.g. A sales dashboard with revenue and churn KPIs and a monthly chart"
        />

        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setPrompt(ex)}
              className="text-left text-[11px] rounded-full border border-surface-border px-2.5 py-1 text-ink-secondary hover:border-accent-400 hover:text-accent-600"
            >
              {ex.length > 44 ? `${ex.slice(0, 44)}…` : ex}
            </button>
          ))}
        </div>

        {hasExistingWidgets ? (
          <SegmentedField
            label="Apply to canvas"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'append', label: 'Add alongside existing widgets' },
              { value: 'replace', label: 'Replace current dashboard' },
            ]}
          />
        ) : null}

        <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2.5 text-xs text-ink-secondary">
          <Sparkles size={14} className="text-accent-500 shrink-0" />
          Runs fully offline using local rule-based parsing — no data leaves your browser.
        </div>

        <Button icon={Wand2} onClick={handleGenerate} className="self-end">
          Generate dashboard
        </Button>
      </div>
    </Modal>
  );
}
