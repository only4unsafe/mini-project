import { ImageOff } from 'lucide-react';
import { useState } from 'react';

export default function ImageWidgetView({ props }) {
  const [errored, setErrored] = useState(false);

  if (!props.src || errored) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 rounded-xl bg-surface-2 text-ink-muted border border-dashed border-surface-3">
        <ImageOff size={22} />
        <span className="text-xs">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={props.src}
      alt={props.alt || ''}
      draggable={false}
      onError={() => setErrored(true)}
      className="w-full h-full block"
      style={{ objectFit: props.objectFit || 'cover', borderRadius: props.radius || 0 }}
    />
  );
}
