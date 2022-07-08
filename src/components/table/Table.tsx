import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  RowData,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { TableRow } from "./TableRow";
import { TableHeader } from "./TableHeader";
import { TablePagination } from "./TablePagination";
import type { TablePaginationOptions } from "src/hooks/useTablePagination";
import { makeCheckboxHeader } from "./IndeterminateCheckbox";

interface Props<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<TData>[];

  pagination?: TablePaginationOptions;
  options?: {
    sorting?: SortingState;
    setSorting?: OnChangeFn<SortingState>;
    rowSelection?: RowSelectionState;
    setRowSelection?: OnChangeFn<RowSelectionState>;
  };
}

export function Table<TData extends RowData>({
  data,
  columns,
  pagination,
  options = {},
}: Props<TData>) {
  const tableColumns = React.useMemo(() => {
    let cols = columns;

    if (options.rowSelection) {
      cols = [makeCheckboxHeader(), ...cols];
    }

    return cols;
  }, [columns, options.rowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: options.setRowSelection,
    enableRowSelection: true,
    enableSorting: true,
    ...options,
    state: {
      rowSelection: options.rowSelection,
      sorting: options.sorting,
    },
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
