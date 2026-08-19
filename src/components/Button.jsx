import clsx from 'clsx';

const VARIANTS = {
  solid: 'bg-accent-600 text-white hover:bg-accent-700 shadow-sm',
  subtle: 'bg-surface-2 text-ink-primary hover:bg-surface-3',
  outline: 'border border-surface-border text-ink-primary hover:bg-surface-2',
  ghost: 'text-ink-secondary hover:bg-surface-2 hover:text-ink-primary',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

export default function Button({
  variant = 'solid',
  size = 'md',
  className,
  icon: Icon,
  iconRight: IconRight,
  children,
  disabled,
  ...rest
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={disabled}
      {...rest}
    >
      {Icon ? <Icon size={size === 'lg' ? 18 : 16} strokeWidth={2.25} /> : null}
      {children}
      {IconRight ? <IconRight size={size === 'lg' ? 18 : 16} strokeWidth={2.25} /> : null}
    </button>
  );
}
