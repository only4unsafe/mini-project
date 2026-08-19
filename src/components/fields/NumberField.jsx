export default function NumberField({ label, value, onChange, min, max, step = 1, suffix }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label ? <span className="text-xs font-medium text-ink-muted">{label}</span> : null}
      <div className="relative">
        <input
          type="number"
          className="w-full h-9 rounded-lg border border-surface-border bg-surface-0 px-2.5 text-sm text-ink-primary outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const next = e.target.value === '' ? 0 : parseFloat(e.target.value);
            if (!Number.isNaN(next)) onChange(next);
          }}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}
