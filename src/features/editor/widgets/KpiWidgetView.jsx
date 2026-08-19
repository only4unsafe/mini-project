import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KpiWidgetView({ props }) {
  const isUp = props.trend !== 'down';
  return (
    <div
      className="w-full h-full rounded-2xl bg-surface-0 border border-surface-border shadow-panel px-4 py-3.5 flex flex-col justify-between overflow-hidden"
      style={{ borderTop: `4px solid ${props.accentColor}` }}
    >
      <span className="text-xs font-semibold text-ink-muted truncate">{props.title}</span>
      <span className="text-[26px] font-extrabold text-ink-primary leading-tight truncate">
        {props.prefix}
        {props.value}
        {props.suffix}
      </span>
      {props.delta ? (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {props.delta}
        </span>
      ) : null}
    </div>
  );
}
