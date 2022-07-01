import { Table } from "components/table/Table";
import { trpc } from "utils/trpc";
import format from "date-fns/format";

export default function ExpensesPage() {
  const expensesQuery = trpc.useQuery(["expenses.all-infinite"]);
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
        {(expensesQuery.data?.length ?? 0) <= 0 ? (
          <p className="px-5 text-gray-600">There are no expenses yet.</p>
        ) : (
          <Table
            data={(expensesQuery.data ?? []).map((expense, idx) => ({
              id: ++idx,
              amount: expense.amount,
              createdAt: format(expense.createdAt, "yyyy-MM-dd"),
              actions: <div>TODO</div>,
            }))}
            columns={[
              { header: "#", accessorKey: "id" },
              { header: "Amount", accessorKey: "amount" },
              { header: "created At", accessorKey: "createdAt" },
              { header: "actions", accessorKey: "actions" },
            ]}
          />
        )}
      </div>
    </div>
  );
}
