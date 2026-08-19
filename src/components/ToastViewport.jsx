import clsx from 'clsx';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useToastStore } from '../app/store/useToastStore.js';

const ICONS = {
  default: Info,
  success: CheckCircle2,
  error: AlertTriangle,
};

export default function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[300] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant] || ICONS.default;
        return (
          <div
            key={t.id}
            className={clsx(
              'animate-scale-in flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-floating',
              'bg-surface-0 border-surface-border text-ink-primary'
            )}
          >
            <Icon
              size={16}
              className={clsx(
                t.variant === 'success' && 'text-emerald-500',
                t.variant === 'error' && 'text-red-500',
                t.variant === 'default' && 'text-accent-500'
              )}
            />
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
