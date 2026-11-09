export default function DataTable({ columns, rows, minRows = 10, emptyMessage = "No hay registros.", onDelete }) {

  const fillerRows = Math.max(0, minRows - rows.length);

  const totalColumns = columns.length + 1 + (onDelete ? 1 : 0);

  return (

    <div className="data-table__wrapper">

      <table className="data-table">

        <thead>

          <tr>

            <th className="data-table__index">#</th>

            {columns.map((col) => (

              <th key={col.key}>{col.label}</th>

            ))}

            {onDelete && <th>Acciones</th>}

          </tr>

        </thead>

        <tbody>

          {rows.map((row, i) => (

            <tr key={row.id}>

              <td className="data-table__index">{i + 1}</td>

              {columns.map((col) => (

                <td key={col.key}>{col.render ? col.render(row) : row[col.key] || "—"}</td>

              ))}

              {onDelete && (

                <td>

                  <button type="button" aria-label="Eliminar" onClick={() => onDelete(row)}>

                    Eliminar

                  </button>

                </td>

              )}

            </tr>

          ))}

          {Array.from({ length: fillerRows }).map((_, i) => (

            <tr key={`empty-${i}`} className="data-table__filler" aria-hidden="true">

              {Array.from({ length: totalColumns }).map((__, j) => (

                <td key={j}>&nbsp;</td>

              ))}

            </tr>

          ))}

        </tbody>

      </table>

      {rows.length === 0 && minRows === 0 && <p className="data-table__empty">{emptyMessage}</p>}

    </div>

  );

}