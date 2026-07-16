import { forwardRef } from 'react';
import './Textarea.css';

/**
 * Textarea (Figma: kan_text-area)
 * States: default, focus, disabled, invalid
 */
const Textarea = forwardRef(function Textarea(
  { rows = 4, invalid = false, resize = 'vertical', className = '', ...rest },
  ref
) {
  const classes = [
    'kan-textarea',
    invalid ? 'kan-textarea--invalid' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <textarea
      ref={ref}
      rows={rows}
      className={classes}
      style={{ resize }}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});

export default Textarea;
