import './Layout.css';

const spaceScale = {
  0: '0',
  1: 'var(--kan-space-1)',
  2: 'var(--kan-space-2)',
  3: 'var(--kan-space-3)',
  4: 'var(--kan-space-4)',
  5: 'var(--kan-space-5)',
  6: 'var(--kan-space-6)',
  7: 'var(--kan-space-7)',
  8: 'var(--kan-space-8)',
  9: 'var(--kan-space-9)',
  10: 'var(--kan-space-10)',
  12: 'var(--kan-space-12)',
  16: 'var(--kan-space-16)',
};

const resolveGap = (g) => spaceScale[g] ?? (typeof g === 'number' ? `${g}px` : g);

/**
 * Stack — vertical flex layout with token-based gap.
 */
export function Stack({ as: Tag = 'div', gap = 4, align, justify, className = '', style, children, ...rest }) {
  const styles = {
    display: 'flex',
    flexDirection: 'column',
    gap: resolveGap(gap),
    alignItems: align,
    justifyContent: justify,
    ...style,
  };
  return (
    <Tag className={['kan-stack', className].filter(Boolean).join(' ')} style={styles} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Inline — horizontal flex layout with token-based gap and wrap.
 */
export function Inline({
  as: Tag = 'div',
  gap = 4,
  align = 'center',
  justify,
  wrap = false,
  className = '',
  style,
  children,
  ...rest
}) {
  const styles = {
    display: 'flex',
    flexDirection: 'row',
    gap: resolveGap(gap),
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...style,
  };
  return (
    <Tag className={['kan-inline', className].filter(Boolean).join(' ')} style={styles} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Divider — horizontal or vertical rule.
 */
export function Divider({ vertical = false, className = '', ...rest }) {
  return (
    <hr
      className={[
        'kan-divider',
        vertical ? 'kan-divider--vertical' : 'kan-divider--horizontal',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
}

/**
 * Spinner — standalone loading indicator.
 */
export function Spinner({ size = 20, className = '', ...rest }) {
  return (
    <span
      className={['kan-spinner', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
      {...rest}
    />
  );
}

