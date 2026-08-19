export default function TextField({ label, value, onChange, placeholder, multiline, rows = 3 }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label ? <span className="text-xs font-medium text-ink-muted">{label}</span> : null}
      {multiline ? (
        <textarea
          className="w-full rounded-lg border border-surface-border bg-surface-0 px-2.5 py-2 text-sm text-ink-primary outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 resize-none"
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="w-full h-9 rounded-lg border border-surface-border bg-surface-0 px-2.5 text-sm text-ink-primary outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
