import clsx from 'clsx';

export default function IconButton({ icon: Icon, active, className, size = 18, label, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex items-center justify-center rounded-md w-8 h-8 transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
        'disabled:opacity-30 disabled:pointer-events-none',
        active
          ? 'bg-accent-600 text-white hover:bg-accent-700'
          : 'text-ink-secondary hover:bg-surface-2 hover:text-ink-primary',
        className
      )}
      {...rest}
    >
      <Icon size={size} strokeWidth={2.25} />
    </button>
  );
}
