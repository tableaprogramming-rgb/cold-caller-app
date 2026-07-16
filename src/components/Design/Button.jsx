import './Button.css';

/**
 * Button (Figma: kan_button)
 * Variants: primary | secondary | ghost | danger | icon
 * Sizes:    sm | md | lg
 * States:   default, hover, active, disabled, loading (handled via CSS + props)
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  loading = false,
  disabled = false,
  iconOnly = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'kan-btn',
    `kan-btn--${variant}`,
    `kan-btn--${size}`,
    fullWidth ? 'kan-btn--block' : '',
    iconOnly ? 'kan-btn--icon' : '',
    loading ? 'kan-btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="kan-btn__spinner" aria-hidden="true" />}
      {!loading && leftIcon && <span className="kan-btn__icon">{leftIcon}</span>}
      {children && <span className="kan-btn__label">{children}</span>}
      {!loading && rightIcon && <span className="kan-btn__icon">{rightIcon}</span>}
    </button>
  );
}

