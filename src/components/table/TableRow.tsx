import { flexRender, Row, RowData } from "@tanstack/react-table";
import { classNames } from "components/sidebar/Sidebar";

interface Props<TData extends RowData> {
  row: Row<TData>;
}

export function TableRow<RowType extends object>({ row }: Props<RowType>) {
  return (
    <tr
      className={classNames("border-b transition-colors bg-transparent hover:bg-gray-100/60")}
      data-row-index={row.index}
      key={row.id}
    >
      {row.getVisibleCells().map((cell) => {
        return (
          <td
            className={classNames(
              "first:px-5 m-0 text-left p-3 px-3",
              cell.column.id === "actions" && "!w-[100px] text-end",
            )}
            key={cell.id}
          >
            {flexRender(cell.getValue(), cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}
