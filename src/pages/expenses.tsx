import * as React from "react";
import { Table } from "components/table/Table";
import { trpc } from "utils/trpc";
import { useTablePagination } from "src/hooks/useTablePagination";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import { EarningsEntryDate, Expenses, Month } from "@prisma/client";
import { Button } from "components/Button";
import type { SortingState } from "@tanstack/react-table";
import { Dropdown } from "components/dropdown/Dropdown";
import { Modal } from "components/modal/Modal";
import { ExpensesForm } from "components/expenses/ExpensesForm";
import { Loader } from "components/Loader";
import type { TableFilter } from "components/table/filters/TableFilters";

export interface Expense extends Expenses {
  date: Pick<EarningsEntryDate, "month" | "year">;
}

export default function ExpensesPage() {
  const [page, setPage] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<TableFilter[]>([]);

  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState(false);
  const [tempExpense, setTempExpense] = React.useState<Expense | null>(null);

  const context = trpc.useContext();
  const expensesQuery = trpc.useQuery(["expenses.all-infinite", { page, sorting, filters }], {
    keepPreviousData: true,
  });

  const deleteExpense = trpc.useMutation("expenses.delete-expense", {
    onSuccess: () => {
      context.invalidateQueries(["expenses.all-infinite"]);
    },
  });

  const pagination = useTablePagination({
    isLoading: expensesQuery.isRefetching || expensesQuery.isLoading,
    query: expensesQuery,
    page,
    setPage,
  });

  async function handleDeleteExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!tempExpense) return;

    await deleteExpense.mutateAsync({
      id: tempExpense.id,
    });

    setTempExpense(null);
    setDeleteOpen(false);
  }

  function handleEditExpense(expense: Expense) {
    setIsOpen(true);
    setTempExpense(expense);
  }

  function handleDeleteExpenseClick(expense: Expense) {
    setDeleteOpen(true);
    setTempExpense(expense);
  }

  function handleClose() {
    setTempExpense(null);
    setIsOpen(false);
  }

  function handleCloseDelete() {
    setDeleteOpen(false);
    setTempExpense(null);
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
        {expensesQuery.isLoading ? (
          <Loader fixed />
        ) : (expensesQuery.data?.items.length ?? 0) <= 0 ? (
          <p className="text-neutral-300">There are no expenses yet.</p>
        ) : (
          <Table
            options={{ sorting, setSorting, filters, setFilters }}
            pagination={pagination}
            query={expensesQuery}
            filterTypes={[
              { name: "amount", filterType: "number" },
              { name: "month", filterType: "enum", options: Object.values(Month) },
              { name: "year", filterType: "number" },
              { name: "description", filterType: "string" },
            ]}
            data={(expensesQuery.data?.items ?? []).map((expense) => ({
              amount: <span className="font-mono">&euro;{expense.amount}</span>,
              month: expense.date.month,
              year: expense.date.year,
              description: expense.description || "None",
              actions: (
                <Dropdown
                  trigger={
                    <Button size="xss" aria-label="Row options">
                      <ThreeDotsVertical />
                    </Button>
                  }
                >
                  <Dropdown.Item onClick={() => handleEditExpense(expense)}>Edit</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleDeleteExpenseClick(expense)}>
                    Delete
                  </Dropdown.Item>
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
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <Modal.Title>{tempExpense ? "Edit Expense" : "Add new expense"}</Modal.Title>
        {tempExpense ? null : (
          <Modal.Description>
            Add a new expense. This expense will be visible on the chart once added.
          </Modal.Description>
        )}

        <div>
          <ExpensesForm onSubmit={handleClose} expense={tempExpense} />
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onOpenChange={handleCloseDelete}>
        <form onSubmit={handleDeleteExpense}>
          <Modal.Title>Delete Expense</Modal.Title>
          <Modal.Description>
            Are you sure you want to delete this expense? This action cannot be undone.
          </Modal.Description>

          <footer className="mt-5 flex justify-end gap-3">
            <Modal.Close>
              <Button disabled={deleteExpense.isLoading} type="reset">
                Nope, Cancel
              </Button>
            </Modal.Close>
            <Button
              className="flex items-center gap-2"
              disabled={deleteExpense.isLoading}
              variant="danger"
              type="submit"
            >
              {deleteExpense.isLoading ? <Loader size="sm" /> : null}
              Yes, delete expense
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
