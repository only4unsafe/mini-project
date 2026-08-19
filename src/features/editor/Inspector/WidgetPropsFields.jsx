import { Plus, Trash2 } from 'lucide-react';
import TextField from '../../../components/fields/TextField.jsx';
import NumberField from '../../../components/fields/NumberField.jsx';
import SelectField from '../../../components/fields/SelectField.jsx';
import ColorField from '../../../components/fields/ColorField.jsx';
import SegmentedField from '../../../components/fields/SegmentedField.jsx';
import Button from '../../../components/Button.jsx';
import { WIDGET_TYPES } from '../WidgetLibrary/widgetDefinitions.js';

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-3 border-t border-surface-border py-4 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
      {children}
    </div>
  );
}

export default function WidgetPropsFields({ widget, onChangeProps }) {
  const p = widget.props;

  switch (widget.type) {
    case WIDGET_TYPES.TEXT:
      return (
        <Section title="Text">
          <TextField label="Content" value={p.content} onChange={(v) => onChangeProps({ content: v })} multiline />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Font size" value={p.fontSize} min={8} max={120} onChange={(v) => onChangeProps({ fontSize: v })} />
            <SelectField
              label="Weight"
              value={String(p.fontWeight)}
              onChange={(v) => onChangeProps({ fontWeight: Number(v) })}
              options={[
                { value: '400', label: 'Regular' },
                { value: '500', label: 'Medium' },
                { value: '600', label: 'Semibold' },
                { value: '700', label: 'Bold' },
                { value: '800', label: 'Extra bold' },
              ]}
            />
          </div>
          <SegmentedField
            label="Align"
            value={p.align}
            onChange={(v) => onChangeProps({ align: v })}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />
          <ColorField label="Color" value={p.color} onChange={(v) => onChangeProps({ color: v })} />
        </Section>
      );

    case WIDGET_TYPES.KPI:
      return (
        <Section title="KPI Card">
          <TextField label="Title" value={p.title} onChange={(v) => onChangeProps({ title: v })} />
          <div className="grid grid-cols-3 gap-3">
            <TextField label="Prefix" value={p.prefix} onChange={(v) => onChangeProps({ prefix: v })} />
            <TextField label="Value" value={p.value} onChange={(v) => onChangeProps({ value: v })} />
            <TextField label="Suffix" value={p.suffix} onChange={(v) => onChangeProps({ suffix: v })} />
          </div>
          <TextField label="Delta label" value={p.delta} onChange={(v) => onChangeProps({ delta: v })} />
          <SegmentedField
            label="Trend"
            value={p.trend}
            onChange={(v) => onChangeProps({ trend: v })}
            options={[
              { value: 'up', label: 'Up' },
              { value: 'down', label: 'Down' },
            ]}
          />
          <ColorField label="Accent color" value={p.accentColor} onChange={(v) => onChangeProps({ accentColor: v })} />
        </Section>
      );

    case WIDGET_TYPES.CHART:
      return (
        <Section title="Chart">
          <TextField label="Title" value={p.title} onChange={(v) => onChangeProps({ title: v })} />
          <SegmentedField
            label="Type"
            value={p.chartKind}
            onChange={(v) => onChangeProps({ chartKind: v })}
            options={[
              { value: 'bar', label: 'Bar' },
              { value: 'line', label: 'Line' },
              { value: 'area', label: 'Area' },
              { value: 'pie', label: 'Pie' },
            ]}
          />
          <ColorField label="Color" value={p.color} onChange={(v) => onChangeProps({ color: v })} />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs text-ink-secondary">
              <input type="checkbox" checked={p.showGrid} onChange={(e) => onChangeProps({ showGrid: e.target.checked })} />
              Grid
            </label>
            <label className="flex items-center gap-2 text-xs text-ink-secondary">
              <input type="checkbox" checked={p.showLegend} onChange={(e) => onChangeProps({ showLegend: e.target.checked })} />
              Legend
            </label>
          </div>
          <DataPointEditor
            data={p.data}
            onChange={(data) => onChangeProps({ data })}
          />
        </Section>
      );

    case WIDGET_TYPES.TABLE:
      return (
        <Section title="Table">
          <TextField label="Title" value={p.title} onChange={(v) => onChangeProps({ title: v })} />
          <TableEditor
            columns={p.columns}
            rows={p.rows}
            onChange={(patch) => onChangeProps(patch)}
          />
        </Section>
      );

    case WIDGET_TYPES.IMAGE:
      return (
        <Section title="Image">
          <TextField label="Image URL" value={p.src} onChange={(v) => onChangeProps({ src: v })} />
          <TextField label="Alt text" value={p.alt} onChange={(v) => onChangeProps({ alt: v })} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Fit"
              value={p.objectFit}
              onChange={(v) => onChangeProps({ objectFit: v })}
              options={[
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Contain' },
                { value: 'fill', label: 'Fill' },
              ]}
            />
            <NumberField label="Corner radius" value={p.radius} min={0} max={100} onChange={(v) => onChangeProps({ radius: v })} />
          </div>
        </Section>
      );

    case WIDGET_TYPES.BUTTON:
      return (
        <Section title="Button">
          <TextField label="Label" value={p.label} onChange={(v) => onChangeProps({ label: v })} />
          <SegmentedField
            label="Style"
            value={p.variant}
            onChange={(v) => onChangeProps({ variant: v })}
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'outline', label: 'Outline' },
            ]}
          />
          <ColorField label="Color" value={p.color} onChange={(v) => onChangeProps({ color: v })} />
          <p className="text-[11px] leading-relaxed text-ink-muted">
            Connect this button to actions in the Workflow tab using the "Button Clicked" trigger.
          </p>
        </Section>
      );

    case WIDGET_TYPES.SHAPE:
      return (
        <Section title="Shape">
          <SegmentedField
            label="Kind"
            value={p.shapeKind}
            onChange={(v) => onChangeProps({ shapeKind: v })}
            options={[
              { value: 'rectangle', label: 'Rectangle' },
              { value: 'ellipse', label: 'Ellipse' },
              { value: 'line', label: 'Line' },
            ]}
          />
          <ColorField label="Fill" value={p.fill} onChange={(v) => onChangeProps({ fill: v })} />
          <ColorField label="Stroke" value={p.stroke} onChange={(v) => onChangeProps({ stroke: v })} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Stroke width" value={p.strokeWidth} min={0} max={20} onChange={(v) => onChangeProps({ strokeWidth: v })} />
            <NumberField label="Corner radius" value={p.radius} min={0} max={100} onChange={(v) => onChangeProps({ radius: v })} />
          </div>
        </Section>
      );

    case WIDGET_TYPES.GAUGE:
      return (
        <Section title="Gauge">
          <TextField label="Title" value={p.title} onChange={(v) => onChangeProps({ title: v })} />
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="Value" value={p.value} onChange={(v) => onChangeProps({ value: v })} />
            <NumberField label="Min" value={p.min} onChange={(v) => onChangeProps({ min: v })} />
            <NumberField label="Max" value={p.max} onChange={(v) => onChangeProps({ max: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Unit" value={p.unit} onChange={(v) => onChangeProps({ unit: v })} />
            <ColorField label="Color" value={p.color} onChange={(v) => onChangeProps({ color: v })} />
          </div>
        </Section>
      );

    default:
      return null;
  }
}

function DataPointEditor({ data, onChange }) {
  function updatePoint(index, patch) {
    onChange(data.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }
  function removePoint(index) {
    onChange(data.filter((_, i) => i !== index));
  }
  function addPoint() {
    onChange([...data, { label: `Point ${data.length + 1}`, value: 10 }]);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-ink-muted">Data</span>
      <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
        {data.map((point, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              className="w-full h-8 rounded-md border border-surface-border bg-surface-0 px-2 text-xs outline-none focus:border-accent-500"
              value={point.label}
              onChange={(e) => updatePoint(i, { label: e.target.value })}
            />
            <input
              type="number"
              className="w-16 h-8 rounded-md border border-surface-border bg-surface-0 px-2 text-xs outline-none focus:border-accent-500"
              value={point.value}
              onChange={(e) => updatePoint(i, { value: parseFloat(e.target.value) || 0 })}
            />
            <button type="button" onClick={() => removePoint(i)} className="text-ink-muted hover:text-red-500 shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <Button variant="subtle" size="sm" icon={Plus} onClick={addPoint} className="self-start">
        Add point
      </Button>
    </div>
  );
}

function TableEditor({ columns, rows, onChange }) {
  function updateColumn(index, value) {
    onChange({ columns: columns.map((c, i) => (i === index ? value : c)) });
  }
  function addColumn() {
    onChange({ columns: [...columns, `Column ${columns.length + 1}`], rows: rows.map((r) => [...r, '']) });
  }
  function removeColumn(index) {
    onChange({ columns: columns.filter((_, i) => i !== index), rows: rows.map((r) => r.filter((_, i) => i !== index)) });
  }
  function updateCell(rowIndex, colIndex, value) {
    onChange({ rows: rows.map((r, ri) => (ri === rowIndex ? r.map((c, ci) => (ci === colIndex ? value : c)) : r)) });
  }
  function addRow() {
    onChange({ rows: [...rows, columns.map(() => '')] });
  }
  function removeRow(rowIndex) {
    onChange({ rows: rows.filter((_, ri) => ri !== rowIndex) });
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-ink-muted">Columns</span>
      <div className="flex flex-col gap-1.5">
        {columns.map((col, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              className="w-full h-8 rounded-md border border-surface-border bg-surface-0 px-2 text-xs outline-none focus:border-accent-500"
              value={col}
              onChange={(e) => updateColumn(i, e.target.value)}
            />
            <button type="button" onClick={() => removeColumn(i)} className="text-ink-muted hover:text-red-500 shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <Button variant="subtle" size="sm" icon={Plus} onClick={addColumn} className="self-start">
        Add column
      </Button>

      <span className="text-xs font-medium text-ink-muted mt-2">Rows</span>
      <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
        {rows.map((row, ri) => (
          <div key={ri} className="flex items-center gap-1.5">
            <div className="grid gap-1.5 flex-1" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0,1fr))` }}>
              {row.map((cell, ci) => (
                <input
                  key={ci}
                  className="h-8 w-full rounded-md border border-surface-border bg-surface-0 px-2 text-xs outline-none focus:border-accent-500"
                  value={cell}
                  onChange={(e) => updateCell(ri, ci, e.target.value)}
                />
              ))}
            </div>
            <button type="button" onClick={() => removeRow(ri)} className="text-ink-muted hover:text-red-500 shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <Button variant="subtle" size="sm" icon={Plus} onClick={addRow} className="self-start">
        Add row
      </Button>
    </div>
  );
}
