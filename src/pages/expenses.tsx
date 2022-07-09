import * as React from "react";
import { Table } from "components/table/Table";
import { trpc } from "utils/trpc";
import { useTablePagination } from "src/hooks/useTablePagination";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import type { EarningsEntryDate, Expenses } from "@prisma/client";
import { Button } from "components/Button";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { Dropdown } from "components/dropdown/Dropdown";
import { Modal } from "components/modal/Modal";
import { ExpensesForm } from "components/expenses/ExpensesForm";

export interface Expense extends Expenses {
  date: Pick<EarningsEntryDate, "month" | "year">;
}

export default function ExpensesPage() {
  const [page, setPage] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedRows, setSelectedRows] = React.useState<RowSelectionState>({});

  const [isOpen, setIsOpen] = React.useState(false);
  const [tempExpense, setTempExpense] = React.useState<Expense | null>(null);

  const expensesQuery = trpc.useQuery(["expenses.all-infinite", page], {
    keepPreviousData: true,
  });

  const pagination = useTablePagination({ query: expensesQuery, page, setPage });
  const context = trpc.useContext();

  const deleteExpense = trpc.useMutation("expenses.delete-expense", {
    onSuccess: () => {
      context.invalidateQueries(["expenses.all-infinite"]);
    },
  });

  const deleteBulkExpense = trpc.useMutation("expenses.bulk-delete-expenses", {
    onSuccess: () => {
      context.invalidateQueries(["expenses.all-infinite"]);
    },
  });

  function handleDeleteExpense(expense: Expense) {
    deleteExpense.mutate({
      id: expense.id,
    });
  }

  async function handleBulkDeleteExpenses() {
    const expenseIds = [];

    for (const idx in selectedRows) {
      const expense = expensesQuery.data?.items[parseInt(idx, 10)];
      if (!expense) continue;

      expenseIds.push(expense.id);
    }

    await deleteBulkExpense.mutateAsync({
      ids: expenseIds,
    });
    setSelectedRows({});
  }

  function handleEditExpense(expense: Expense) {
    setIsOpen(true);
    setTempExpense(expense);
  }

  function handleClose() {
    setTempExpense(null);
    setIsOpen(false);
  }

  async function addNewExpense() {
    setIsOpen(true);
  }

  return (
    <div className="m-8 mx-10 h-full">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between w-full mb-5 gap-y-3">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-serif">Expenses</h1>
          <p className="mt-4 font-medium">A list of all expenses from any year starting in 2018.</p>
        </div>

        <div>
          <Button onClick={addNewExpense}>Add new expense</Button>
        </div>
      </header>

      <div className="mt-5">
        {(expensesQuery.data?.items.length ?? 0) <= 0 ? (
          <p className="text-neutral-300">There are no expenses yet.</p>
        ) : (
          <div>
            <div className="mb-2">
              <Button
                onClick={handleBulkDeleteExpenses}
                disabled={deleteBulkExpense.isLoading || Object.keys(selectedRows).length <= 0}
              >
                Delete selected expenses
              </Button>
            </div>

            <Table
              options={{
                sorting,
                setSorting,
                rowSelection: selectedRows,
                setRowSelection: setSelectedRows,
              }}
              pagination={pagination}
              data={(expensesQuery.data?.items ?? []).map((expense, idx) => ({
                id: 35 * page + idx + 1,
                amount: expense.amount,
                month: expense.date.month,
                year: expense.date.year,
                description: expense.description || "None",
                actions: (
                  <Dropdown
                    trigger={
                      <Button>
                        <ThreeDotsVertical />
                      </Button>
                    }
                  >
                    <Dropdown.Item onClick={() => handleEditExpense(expense)}>Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDeleteExpense(expense)}>
                      Delete
                    </Dropdown.Item>
                  </Dropdown>
                ),
              }))}
              columns={[
                { header: "#", accessorKey: "id" },
                { header: "Amount", accessorKey: "amount" },
                { header: "Month", accessorKey: "month" },
                { header: "Year", accessorKey: "year" },
                { header: "Description", accessorKey: "description" },
                { header: "actions", accessorKey: "actions" },
              ]}
            />
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <Modal.Title>Add new expense</Modal.Title>
        <Modal.Description>
          Add a new expense. This expense will be visible on the chart once added.
        </Modal.Description>

        <div>
          <ExpensesForm onSubmit={handleClose} expense={tempExpense} />
        </div>
      </Modal>
    </div>
  );
}
