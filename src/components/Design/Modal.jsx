import { useEffect } from 'react';
import './Modal.css';

/**
 * Modal / Pop-Up (Figma: Pop-Up)
 * Overlay dialog with header, body and footer slots.
 * Sizes: sm | md | lg. Closes on overlay click (unless disabled) and Escape.
 */
export default function Modal({
  open,
  onClose,
  title,
  size = 'md',
  closeOnOverlay = true,
  showClose = true,
  footer = null,
  className = '',
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="kan-modal__overlay"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        className={['kan-modal', `kan-modal--${size}`, className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="kan-modal__header">
            {title && <h2 className="kan-modal__title">{title}</h2>}
            {showClose && (
              <button
                type="button"
                className="kan-modal__close"
                onClick={onClose}
                aria-label="Close"
              >
                &times;
              </button>
            )}
          </div>
        )}
        <div className="kan-modal__body">{children}</div>
        {footer && <div className="kan-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

