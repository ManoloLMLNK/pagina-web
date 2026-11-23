export default function DataTable({

  columns,
  rows,
  minRows = 10,
  emptyMessage = "No hay registros.",
  onEdit,
  onDelete,
  canEdit = () => true,
  canDelete = () => true,

}) {

  const fillerRows = Math.max(0, minRows - rows.length);

  const hasActions = Boolean(onEdit || onDelete);

  const totalColumns = columns.length + 1 + (hasActions ? 1 : 0);

  return (

    <div className="data-table__wrapper">

      <table className="data-table">

        <thead>

          <tr>

            <th className="data-table__index">#</th>

            {columns.map((col) => (

              <th key={col.key}>{col.label}</th>

            ))}

            {hasActions && <th>Acciones</th>}

          </tr>

        </thead>

        <tbody>

          {rows.map((row, i) => (

            <tr key={row.id}>

              <td className="data-table__index">{i + 1}</td>

              {columns.map((col) => (

                <td key={col.key}>{col.render ? col.render(row) : row[col.key] || "—"}</td>

              ))}

              {hasActions && (

                <td>

                  {onEdit && canEdit(row) && (

                    <button type="button" aria-label="Editar" onClick={() => onEdit(row)}>

                      Editar

                    </button>

                  )}

                  {onEdit && canEdit(row) && onDelete && canDelete(row) && " "}

                  {onDelete && canDelete(row) && (

                    <button type="button" aria-label="Eliminar" onClick={() => onDelete(row)}>

                      Eliminar

                    </button>

                  )}

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