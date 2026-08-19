export default function TextWidgetView({ props }) {
  const justify = props.align === 'center' ? 'center' : props.align === 'right' ? 'flex-end' : 'flex-start';
  return (
    <div
      className="w-full h-full flex items-center overflow-hidden px-1"
      style={{ justifyContent: justify, fontSize: props.fontSize, fontWeight: props.fontWeight, color: props.color, textAlign: props.align }}
    >
      <span className="whitespace-pre-wrap break-words">{props.content}</span>
    </div>
  );
}
