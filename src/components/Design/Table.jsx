import './Table.css';

/**
 * Table (Figma: Table + Table Cell)
 * Declarative data table with sticky header and hover rows.
 *
 * columns: [{ key, header, render?(row), align?, width? }]
 * data:    array of row objects
 * rowKey:  key field or (row, i) => string
 */
export default function Table({
  columns = [],
  data = [],
  rowKey = 'id',
  onRowClick,
  emptyMessage = 'No records found.',
  className = '',
}) {
  const keyFor = (row, i) =>
    typeof rowKey === 'function' ? rowKey(row, i) : row?.[rowKey] ?? i;

  return (
    <div className={['kan-table__wrapper', className].filter(Boolean).join(' ')}>
      <table className="kan-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ textAlign: col.align || 'left', width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="kan-table__empty" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={keyFor(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'kan-table__row--clickable' : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row, i) : row?.[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

