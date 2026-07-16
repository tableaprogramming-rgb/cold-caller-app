import './Text.css';

/**
 * Text (Figma: kan_text)
 * sizes:   xs | sm | base | md | lg | xl | 2xl
 * weights: regular | medium | semibold | bold
 * tones:   default | muted | subtle | placeholder | strong | primary | error | success
 */
export default function Text({
  as: Tag = 'span',
  size = 'base',
  weight = 'regular',
  tone = 'default',
  truncate = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'kan-text',
    `kan-text--${size}`,
    `kan-text--w-${weight}`,
    `kan-text--tone-${tone}`,
    truncate ? 'kan-text--truncate' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Link (Figma: kan_link)
 * types: nav | email | phone | external
 */
export function Link({ type = 'nav', href, className = '', children, ...rest }) {
  const resolvedHref =
    type === 'email' && href && !href.startsWith('mailto:')
      ? `mailto:${href}`
      : type === 'phone' && href && !href.startsWith('tel:')
        ? `tel:${href}`
        : href;

  return (
    <a
      href={resolvedHref}
      className={['kan-link', `kan-link--${type}`, className].filter(Boolean).join(' ')}
      {...(type === 'external' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}

