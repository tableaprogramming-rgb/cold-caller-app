import { forwardRef } from 'react';
import './Select.css';

/**
 * Select (Figma: Select / Element Plus dropdown)
 * options: array of { value, label } or strings
 * States: default, focus, disabled, invalid
 */
const Select = forwardRef(function Select(
  {
    options = [],
    size = 'md',
    invalid = false,
    fullWidth = true,
    placeholder = null,
    className = '',
    children,
    ...rest
  },
  ref
) {
  const classes = [
    'kan-select',
    `kan-select--${size}`,
    invalid ? 'kan-select--invalid' : '',
    fullWidth ? 'kan-select--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const normalized = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o
  );

  return (
    <div className={classes}>
      <select ref={ref} className="kan-select__control" aria-invalid={invalid || undefined} {...rest}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children ||
          normalized.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
      </select>
      <span className="kan-select__chevron" aria-hidden="true">▾</span>
    </div>
  );
});

export default Select;
