export default function ShapeWidgetView({ props }) {
  if (props.shapeKind === 'line') {
    return (
      <div className="w-full h-full flex items-center">
        <div className="w-full" style={{ height: props.strokeWidth || 2, background: props.stroke }} />
      </div>
    );
  }

  return (
    <div
      className="w-full h-full"
      style={{
        background: props.fill,
        border: `${props.strokeWidth || 0}px solid ${props.stroke}`,
        borderRadius: props.shapeKind === 'ellipse' ? '50%' : props.radius || 0,
      }}
    />
  );
}
