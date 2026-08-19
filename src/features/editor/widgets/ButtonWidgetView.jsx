export default function ButtonWidgetView({ props, onActivate, interactive }) {
  const isOutline = props.variant === 'outline';
  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={() => interactive && onActivate?.()}
      className="w-full h-full rounded-xl border-2 font-semibold text-sm transition-transform active:scale-[0.98]"
      style={{
        background: isOutline ? 'transparent' : props.color,
        color: isOutline ? props.color : '#fff',
        borderColor: props.color,
        cursor: interactive ? 'pointer' : 'default',
      }}
    >
      {props.label}
    </button>
  );
}
