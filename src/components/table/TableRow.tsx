import { flexRender, Row, RowData } from "@tanstack/react-table";
import { classNames } from "components/sidebar/Sidebar";

interface Props<TData extends RowData> {
  row: Row<TData>;
}

export function TableRow<RowType extends object>({ row }: Props<RowType>) {
  return (
    <tr
      className={classNames(row.index % 2 && "bg-indigo-100/40")}
      data-row-index={row.index}
      key={row.id}
    >
      {row.getVisibleCells().map((cell) => {
        return (
          <td className={classNames("first:px-5 m-0 text-left p-3 px-3")} key={cell.id}>
            {flexRender(cell.getValue(), cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}
