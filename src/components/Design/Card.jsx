import './Card.css';

/**
 * Card (Figma: Card)
 * Container with optional header/footer slots and interactive/hover states.
 */
export default function Card({
  header = null,
  footer = null,
  interactive = false,
  padded = true,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'kan-card',
    interactive ? 'kan-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {header && <div className="kan-card__header">{header}</div>}
      <div className={padded ? 'kan-card__body' : 'kan-card__body kan-card__body--flush'}>
        {children}
      </div>
      {footer && <div className="kan-card__footer">{footer}</div>}
    </div>
  );
}

