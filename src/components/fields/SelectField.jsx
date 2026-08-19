export default function SelectField({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label ? <span className="text-xs font-medium text-ink-muted">{label}</span> : null}
      <select
        className="w-full h-9 rounded-lg border border-surface-border bg-surface-0 px-2.5 text-sm text-ink-primary outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
