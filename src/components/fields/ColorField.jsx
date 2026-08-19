export default function ColorField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label ? <span className="text-xs font-medium text-ink-muted">{label}</span> : null}
      <div className="flex items-center gap-2 h-9 rounded-lg border border-surface-border bg-surface-0 px-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-6 shrink-0 cursor-pointer rounded border-none bg-transparent p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-ink-primary outline-none"
        />
      </div>
    </label>
  );
}
