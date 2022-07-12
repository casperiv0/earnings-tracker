import { flexRender, Row, RowData } from "@tanstack/react-table";
import { classNames } from "utils/classNames";

interface Props<TData extends RowData> {
  row: Row<TData>;
  idx: number;
}

export function TableRow<RowType extends object>({ row, idx }: Props<RowType>) {
  return (
    <tr
      // todo: add color if row is selected
      className={classNames(idx % 2 !== 0 && "bg-quaternary/60")}
      data-row-index={idx}
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
