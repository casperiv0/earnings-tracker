import { flexRender, Row, RowData } from "@tanstack/react-table";
import { classNames } from "components/sidebar/Sidebar";

interface Props<TData extends RowData> {
  row: Row<TData>;
}

export function TableRow<RowType extends object>({ row }: Props<RowType>) {
  return (
    <tr
      className={classNames(
        "transition-colors bg-transparent",
        row.index % 2 !== 0 && "bg-quaternary/60",
      )}
      data-row-index={row.index}
      key={row.id}
    >
      {row.getVisibleCells().map((cell) => {
        const cellValue =
          cell.column.id === "select" ? cell.column.columnDef.cell : cell.getValue();

        return (
          <td
            className={classNames(
              "first:px-5 m-0 text-left p-3 px-3",
              cell.column.id === "actions" && "!w-[100px] text-end",
            )}
            key={cell.id}
          >
            {flexRender(cellValue, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}
