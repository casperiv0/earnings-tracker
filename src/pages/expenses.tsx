import * as React from "react";
import { Table } from "components/table/Table";
import { trpc } from "utils/trpc";
import { useTablePagination } from "src/hooks/useTablePagination";

export default function ExpensesPage() {
  const [page, setPage] = React.useState<number>(0);
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

  async function addNewExpense() {
    addExpense.mutate({
      amount: 100,
      month: "July",
      year: 2022,
    });
  }

  return (
    <div className="m-5 h-full bg-white rounded-md shadow-md">
      <header className="flex items-center justify-between w-full pb-0 p-5">
        <h1 className="text-2xl font-semibold">Expenses</h1>

        <div>
          <button
            onClick={addNewExpense}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm text-white rounded-md"
          >
            Add new expense
          </button>
        </div>
      </header>

      <div className="mt-5">
        {(expensesQuery.data?.items.length ?? 0) <= 0 ? (
          <p className="px-5 text-gray-600">There are no expenses yet.</p>
        ) : (
          <Table
            pagination={pagination}
            data={(expensesQuery.data?.items ?? []).map((expense, idx) => ({
              id: ++idx,
              amount: expense.amount,
              month: expense.date.month,
              year: expense.date.year,
              actions: <div>TODO</div>,
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
