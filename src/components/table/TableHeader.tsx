import { flexRender, Header, RowData } from "@tanstack/react-table";
import { classNames } from "components/sidebar/Sidebar";

interface Props<TData extends RowData> {
  header: Header<TData>;
}

export function TableHeader<TData extends RowData>({ header }: Props<TData>) {
  const canSort = header.id === "actions" ? false : header.column.getCanSort();

  return (
    <th
      className={classNames(
        "p-3 px-3 bg-[#f2f3f7] border-t-[1.5px] border-b-[1.5px] border-gray-300 text-neutral-600 font-semibold text-xs text-left select-none",
        "first:px-5 uppercase",
        canSort && "cursor-pointer select-none",
        header.id === "actions" && "!w-[100px] text-end",
      )}
      key={header.id}
      colSpan={header.colSpan}
      data-column-index={header.index}
      onClick={(event) => {
        if (!canSort) return;
        header.column.getToggleSortingHandler()?.(event);
      }}
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header as any, header.getContext())}
      {{
        asc: " 🔼",
        desc: " 🔽",
      }[header.column.getIsSorted() as string] ?? null}
    </th>
  );
}
