"use client";

import { Expenses, Month, ProcessedExpense } from "@prisma/client";
import { ExpandedState, SortingState } from "@tanstack/react-table";
import * as React from "react";
import { ArrowsExpand, ThreeDotsVertical } from "react-bootstrap-icons";
import { Dropdown } from "~/components/dropdown/Dropdown";
import { isProcessedExpense } from "~/components/expenses/ExpensesForm";
import { Table } from "~/components/table/Table";
import { TableFilter } from "~/components/table/filters/TableFilters";
import { Button } from "~/components/ui/Button";
import { useTablePagination } from "~/hooks/useTablePagination";
import { getTotal } from "~/utils/calculations/get-total";
import { NUMBER_FORMATTER } from "~/utils/chart-utils";
import { classNames } from "~/utils/classNames";

interface ExpensesTableListProps {
  query: { maxPages: number; items: Expenses[] };
}

export function ExpensesTableList(props: ExpensesTableListProps) {
  const [page, setPage] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<TableFilter[]>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const data = props.query.items;

  const pagination = useTablePagination({
    isLoading: props.query.isRefetching || props.query.isLoading,
    query: props.query,
    page,
    setPage,
  });

  function handleEditExpense(expense: Expense | ProcessedExpense) {
    setIsOpen(true);
    setTempExpense(expense);
  }

  function handleDeleteExpenseClick(expense: Expense | ProcessedExpense) {
    setDeleteOpen(true);
    setTempExpense(expense);
  }

  return (
    <Table
      footer={
        <>
          <span className="text-base font-semibold text-neutral-300">Total:</span>
          <span className="text-lg font-normal text-neutral-100 font-mono">
            &euro;
            {NUMBER_FORMATTER.format(getTotal({ data }))}
          </span>
        </>
      }
      options={{ sorting, setSorting, filters, setFilters, expanded, setExpanded }}
      pagination={pagination}
      query={props.query}
      filterTypes={[
        { name: "id", filterType: "id" },
        { name: "amount", filterType: "number" },
        { name: "month", filterType: "enum", options: Object.values(Month) },
        { name: "year", filterType: "number" },
        { name: "description", filterType: "string" },
      ]}
      data={data.map((expense, idx) => ({
        subRows: isProcessedExpense(expense)
          ? expense.expenses.map((expense) => ({
              amount: <span className="font-mono">{NUMBER_FORMATTER.format(expense.amount)}</span>,
              month: isProcessedExpense(expense) ? "—" : expense.date.month,
              year: isProcessedExpense(expense) ? "—" : expense.date.year,
              description: expense.description || "None",
            }))
          : [],
        amount: (
          <span
            className={classNames(
              "font-mono",
              isProcessedExpense(expense) && "flex gap-2 items-center",
            )}
          >
            &euro;
            {NUMBER_FORMATTER.format(
              isProcessedExpense(expense) ? expense.totalAmount : expense.amount,
            )}
            {isProcessedExpense(expense) && (
              <Button
                onClick={() => {
                  setExpanded((p) => {
                    if (typeof p === "object") {
                      return { ...p, [idx]: !p[idx] };
                    }

                    return { [idx]: true };
                  });
                }}
                type="button"
                size="xxs"
                variant="default"
                title="View individual expenses for this processed expense"
              >
                <ArrowsExpand aria-label="Expand Rows" />
              </Button>
            )}
          </span>
        ),
        month: expense.date.month,
        year: expense.date.year,
        description: expense.description || "None",
        actions: (
          <Dropdown
            side="left"
            className="flex flex-col"
            trigger={
              <Button size="xxs" aria-label="Row options">
                <ThreeDotsVertical />
              </Button>
            }
          >
            <Dropdown.Item onClick={() => handleEditExpense(expense)}>Edit</Dropdown.Item>
            <Dropdown.Item onClick={() => handleDeleteExpenseClick(expense)}>Delete</Dropdown.Item>
          </Dropdown>
        ),
      }))}
      columns={[
        { header: "Amount", accessorKey: "amount" },
        { header: "Month", accessorKey: "month" },
        { header: "Year", accessorKey: "year" },
        { header: "Description", accessorKey: "description" },
        { header: "actions", accessorKey: "actions" },
      ]}
    />
  );
}
