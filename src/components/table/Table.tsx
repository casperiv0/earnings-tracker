import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  OnChangeFn,
  RowData,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { TableRow } from "./TableRow";
import { TableHeader } from "./TableHeader";
import { TablePagination } from "./TablePagination";

export interface TablePaginationOptions {
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  currentPage: number;
  totalPageCount: number;
  onNextPage(): void;
  onPreviousPage(): void;
  gotoPage(page: number): void;
}

interface Props<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<TData>[];

  pagination?: TablePaginationOptions;
  options?: {
    rowSelection: RowSelectionState;
    setRowSelection: OnChangeFn<RowSelectionState>;
  };
}

export function Table<TData extends RowData>({ data, columns, pagination }: Props<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: true,
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
