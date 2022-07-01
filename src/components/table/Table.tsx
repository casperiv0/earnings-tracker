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

interface TablePagination {
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  onNextPage(): void;
  onPreviousPage(): void;
}

interface Props<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<TData>[];

  pagination?: TablePagination;

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

      {pagination ? (
        <div className="flex items-center justify-center mt-3 gap-2">
          <button
            className="px-3 py-1.5 rounded-md bg-indigo-600 enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-80 transition-colors text-white"
            onClick={pagination.onPreviousPage}
            disabled={pagination.isPreviousDisabled}
          >
            Previous
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-indigo-600 enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-80 transition-colors text-white"
            onClick={pagination.onNextPage}
            disabled={pagination.isNextDisabled}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
