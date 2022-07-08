import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  RowData,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { TableRow } from "./TableRow";
import { TableHeader } from "./TableHeader";
import { TablePagination } from "./TablePagination";
import type { TablePaginationOptions } from "src/hooks/useTablePagination";

interface Props<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<TData>[];

  pagination?: TablePaginationOptions;
  options?: {
    sorting?: SortingState;
    setSorting?(state: SortingState): void;
  };
}

export function Table<TData extends RowData>({
  data,
  columns,
  pagination,
  options = {},
}: Props<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
    ...options,
  });

  return (
    <div>
      <table className="w-full overflow-hidden whitespace-nowrap max-h-64">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return <TableHeader key={header.id} header={header} />;
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} row={row} />
          ))}
        </tbody>
      </table>

      {pagination ? <TablePagination pagination={pagination} /> : null}
    </div>
  );
}
