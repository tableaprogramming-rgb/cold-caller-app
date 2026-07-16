import './Badge.css';

/**
 * Badge (Figma: kan_badge)
 * Variants: owner | editor | viewer | success | info | accent | error | warning | neutral
 * Optional leading status dot.
 */
export default function Badge({ variant = 'neutral', dot = false, className = '', children }) {
  const classes = ['kan-badge', `kan-badge--${variant}`, className].filter(Boolean).join(' ');
  return (
    <span className={classes}>
      {dot && <span className="kan-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

/**
 * StatusDot — standalone status indicator dot.
 */
export function StatusDot({ variant = 'neutral', className = '' }) {
  return (
    <span
      className={['kan-dot', `kan-dot--${variant}`, className].filter(Boolean).join(' ')}
      aria-hidden="true"
    />
  );
}

