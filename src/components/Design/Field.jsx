import { useId, cloneElement, isValidElement } from 'react';
import './Field.css';

/**
 * Field (Figma: kan_field)
 * Form field wrapper: label + control + optional hint / error message.
 * Clones a single valid element child to wire up id + aria attributes.
 */
export default function Field({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  className = '',
  children,
}) {
  const generatedId = useId();
  const controlId = htmlFor || generatedId;
  const describedBy = error ? `${controlId}-error` : hint ? `${controlId}-hint` : undefined;

  const renderedControl = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || controlId,
        invalid: children.props.invalid ?? (!!error || undefined),
        'aria-describedby': children.props['aria-describedby'] || describedBy,
      })
    : children;

  return (
    <div className={['kan-field', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="kan-field__label" htmlFor={controlId}>
          {label}
          {required && (
            <span className="kan-field__required" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      {renderedControl}
      {error ? (
        <p className="kan-field__error" id={`${controlId}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="kan-field__hint" id={`${controlId}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

