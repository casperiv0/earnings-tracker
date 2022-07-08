import * as React from "react";
import { Table } from "components/table/Table";
import { trpc } from "utils/trpc";
import { useTablePagination } from "src/hooks/useTablePagination";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import type { Expenses } from "@prisma/client";
import { Button } from "components/Button";
import type { SortingState } from "@tanstack/react-table";
import { Dropdown } from "components/dropdown/Dropdown";

export default function ExpensesPage() {
  const [page, setPage] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const expensesQuery = trpc.useQuery(["expenses.all-infinite", page], {
    keepPreviousData: true,
  });

  const pagination = useTablePagination({ query: expensesQuery, page, setPage });
  const context = trpc.useContext();

  const addExpense = trpc.useMutation("expenses.add-expense", {
    onSuccess: () => {
      context.invalidateQueries(["expenses.all-infinite"]);
    },
  });

  const deleteExpense = trpc.useMutation("expenses.delete-expense", {
    onSuccess: () => {
      context.invalidateQueries(["expenses.all-infinite"]);
    },
  });

  const editExpense = trpc.useMutation("expenses.edit-expense", {
    onSuccess: () => {
      context.invalidateQueries(["expenses.all-infinite"]);
    },
  });

  function handleDeleteExpense(expense: Expenses) {
    deleteExpense.mutate({
      id: expense.id,
    });
  }

  function handleEditExpense(expense: Expenses, data: any) {
    editExpense.mutate({
      id: expense.id,
      ...data,
    });
  }

  async function addNewExpense() {
    addExpense.mutate({
      amount: 100,
      month: "July",
      year: 2022,
    });
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
          <p className="px-5 text-gray-600">There are no expenses yet.</p>
        ) : (
          <Table
            options={{ sorting, setSorting }}
            pagination={pagination}
            data={(expensesQuery.data?.items ?? []).map((expense, idx) => ({
              id: 35 * page + idx + 1,
              amount: expense.amount,
              month: expense.date.month,
              year: expense.date.year,
              actions: (
                <Dropdown
                  trigger={
                    <Button>
                      <ThreeDotsVertical />
                    </Button>
                  }
                >
                  <Dropdown.Item onClick={() => handleEditExpense(expense, {})}>Edit</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleDeleteExpense(expense)}>Delete</Dropdown.Item>
                </Dropdown>
              ),
            }))}
            columns={[
              { header: "#", accessorKey: "id" },
              { header: "Amount", accessorKey: "amount" },
              { header: "Month", accessorKey: "month" },
              { header: "Year", accessorKey: "year" },
              { header: "actions", accessorKey: "actions" },
            ]}
          />
        )}
      </div>
    </div>
  );
}
