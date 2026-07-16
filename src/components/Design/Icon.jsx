import './Icon.css';

/**
 * Icon — sizing wrapper for SVG/emoji/glyph icons.
 * Renders a fixed square box so any child icon fills it consistently.
 * Pass an SVG element or icon component as `children`, or a `src` for an image asset.
 */
export default function Icon({
  size = 20,
  label,
  src,
  alt = '',
  color,
  className = '',
  children,
  ...rest
}) {
  const style = { width: size, height: size, color };
  const a11y = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };

  return (
    <span className={['kan-icon', className].filter(Boolean).join(' ')} style={style} {...a11y} {...rest}>
      {src ? (
        <img className="kan-icon__img" src={src} alt={alt} draggable={false} />
      ) : (
        children
      )}
    </span>
  );
}

