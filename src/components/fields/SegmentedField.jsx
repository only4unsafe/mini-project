import clsx from 'clsx';

export default function SegmentedField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? <span className="text-xs font-medium text-ink-muted">{label}</span> : null}
      <div className="inline-flex rounded-lg border border-surface-border bg-surface-0 p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={clsx(
              'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
              value === opt.value ? 'bg-accent-600 text-white' : 'text-ink-secondary hover:bg-surface-2'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
