import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7'];

export default function ChartWidgetView({ props }) {
  const data = props.data || [];

  return (
    <div className="w-full h-full rounded-2xl bg-surface-0 border border-surface-border shadow-panel p-3.5 flex flex-col overflow-hidden">
      <span className="text-xs font-semibold text-ink-secondary px-1 pb-2 truncate">{props.title}</span>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {props.chartKind === 'line' ? (
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              {props.showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-3)" /> : null}
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--ink-muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--ink-muted)" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              {props.showLegend ? <Legend wrapperStyle={{ fontSize: 11 }} /> : null}
              <Line type="monotone" dataKey="value" stroke={props.color} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          ) : props.chartKind === 'area' ? (
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              {props.showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-3)" /> : null}
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--ink-muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--ink-muted)" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              {props.showLegend ? <Legend wrapperStyle={{ fontSize: 11 }} /> : null}
              <Area type="monotone" dataKey="value" stroke={props.color} fill={props.color} fillOpacity={0.18} strokeWidth={2.5} />
            </AreaChart>
          ) : props.chartKind === 'pie' ? (
            <PieChart>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              {props.showLegend ? <Legend wrapperStyle={{ fontSize: 11 }} /> : null}
              <Pie data={data} dataKey="value" nameKey="label" innerRadius="45%" outerRadius="80%" paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              {props.showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-3)" /> : null}
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--ink-muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--ink-muted)" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              {props.showLegend ? <Legend wrapperStyle={{ fontSize: 11 }} /> : null}
              <Bar dataKey="value" fill={props.color} radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
