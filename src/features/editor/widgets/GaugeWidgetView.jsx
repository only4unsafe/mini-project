export default function GaugeWidgetView({ props }) {
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const rawValue = Number(props.value ?? 0);
  const clampedValue = Math.min(max, Math.max(min, rawValue));
  const pct = Math.max(0, Math.min(1, (clampedValue - min) / (max - min || 1)));

  // Rainbow/upward arc: should bow outward toward the top, from left (180°) to right (0°)
  const radius = 58;
  const centerX = 90;
  const centerY = 80;

  // Starting point at left (180°)
  const startX = centerX - radius;
  const startY = centerY;

  // Use the upper half of a circle so the arc bows upward instead of inward.
  const currentAngle = Math.PI * (1 - pct);
  const currentX = centerX + radius * Math.cos(currentAngle);
  const currentY = centerY - radius * Math.sin(currentAngle);

  // The full upper semicircle is a 180° arc, so we just need a standard sweep from left to right.
  const largeArc = 0;
  const color = props.color || '#6366f1';

  return (
    <div className="w-full h-full rounded-2xl bg-surface-0 border border-surface-border shadow-panel p-3.5 flex flex-col overflow-hidden">
      <div className="text-xs font-semibold text-ink-secondary px-0.5 pb-2">
        <span className="truncate block">{props.title || 'Gauge'}</span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full">
        <svg 
          viewBox="0 0 180 130" 
          className="w-full"
          style={{ maxHeight: '100%' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background arc: upward rainbow from left to right */}
          <path 
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${centerX + radius} ${startY}`}
            fill="none" 
            stroke="#d0d4dd" 
            strokeWidth="12" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Progress arc: fills upward like a rainbow */}
          {pct > 0.01 && (
            <path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${currentX} ${currentY}`}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Value text centered below */}
          <text 
            x={centerX} 
            y={centerY + 35} 
            fontSize="42" 
            fontWeight="800" 
            textAnchor="middle" 
            fill="var(--ink-primary)"
          >
            {Math.round(clampedValue)}
          </text>
          <text 
            x={centerX} 
            y={centerY + 52} 
            fontSize="13" 
            fontWeight="600" 
            textAnchor="middle" 
            fill="var(--ink-secondary)"
          >
            {props.unit || '%'}
          </text>
        </svg>
      </div>
    </div>
  );
}
