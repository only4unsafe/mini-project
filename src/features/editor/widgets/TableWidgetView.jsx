export default function TableWidgetView({ props }) {
  const columns = props.columns || [];
  const rows = props.rows || [];
  return (
    <div className="w-full h-full rounded-2xl bg-surface-0 border border-surface-border shadow-panel p-3.5 flex flex-col overflow-hidden">
      <span className="text-xs font-semibold text-ink-secondary px-1 pb-2 truncate">{props.title}</span>
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="text-left font-semibold text-ink-muted px-2 py-1.5 border-b border-surface-border sticky top-0 bg-surface-0">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-surface-1">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-1.5 border-b border-surface-2 text-ink-primary">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
