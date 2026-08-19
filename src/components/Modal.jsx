import { useEffect } from 'react';
import { X } from 'lucide-react';
import IconButton from './IconButton.jsx';

export default function Modal({ open, onClose, title, children, width = 480, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    function handleKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="animate-scale-in rounded-2xl bg-surface-0 shadow-floating border border-surface-border flex flex-col max-h-[85vh]"
        style={{ width }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <h2 className="text-sm font-semibold text-ink-primary">{title}</h2>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer ? <div className="px-5 py-4 border-t border-surface-border flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
