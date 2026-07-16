import './Tabs.css';

/**
 * Tabs (Figma: kan_tab)
 * Controlled segmented tab switcher. Mirrors the app's view-toggle style.
 * tabs: array of { value, label, count? }
 * variant: 'segment' (pill toggle) | 'underline'
 */
export default function Tabs({
  tabs = [],
  value,
  onChange,
  variant = 'segment',
  className = '',
}) {
  const classes = ['kan-tabs', `kan-tabs--${variant}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={['kan-tabs__tab', active ? 'is-active' : ''].filter(Boolean).join(' ')}
            onClick={() => onChange?.(tab.value)}
          >
            <span className="kan-tabs__label">{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span className="kan-tabs__count">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

