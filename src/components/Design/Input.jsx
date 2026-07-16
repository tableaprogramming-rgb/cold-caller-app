import { forwardRef } from 'react';
import './Input.css';

/**
 * Input (Figma: kan_input)
 * Types: text | password | email | search | number | tel
 * States: default, focus, disabled, invalid
 */
const Input = forwardRef(function Input(
  {
    type = 'text',
    size = 'md',
    invalid = false,
    fullWidth = true,
    leftAddon = null,
    rightAddon = null,
    className = '',
    ...rest
  },
  ref
) {
  const wrapClasses = [
    'kan-input',
    `kan-input--${size}`,
    invalid ? 'kan-input--invalid' : '',
    fullWidth ? 'kan-input--block' : '',
    leftAddon || rightAddon ? 'kan-input--has-addon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapClasses}>
      {leftAddon && <span className="kan-input__addon kan-input__addon--left">{leftAddon}</span>}
      <input
        ref={ref}
        type={type}
        className="kan-input__control"
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {rightAddon && <span className="kan-input__addon kan-input__addon--right">{rightAddon}</span>}
    </div>
  );
});

export default Input;
