import * as React from "react";
import { Table } from "components/table/Table";
import { trpc } from "utils/trpc";
import { useTablePagination } from "src/hooks/useTablePagination";
import { DotsVerticalIcon } from "@heroicons/react/outline";
import { Menu, Transition } from "@headlessui/react";

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
            className="px-4 py-1 bg-primary hover:bg-black transition-colors shadow-sm text-white rounded-md"
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
              id: 35 * page + idx + 1,
              amount: expense.amount,
              month: expense.date.month,
              year: expense.date.year,
              actions: (
                <Menu as="div" className="relative">
                  {({ open }) => (
                    <>
                      <Menu.Button className="-z-10">
                        <DotsVerticalIcon className="h-5 w-5" />
                      </Menu.Button>

                      <Transition
                        show={open}
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                        className="!z-50 absolute top-3 right-3"
                      >
                        <Menu.Items
                          static
                          className="w-32 flex flex-col bg-white p-2 rounded-md shadow-md"
                        >
                          <Menu.Item
                            className="px-3 py-1 text-left rounded-md hover:bg-gray-100"
                            as="button"
                          >
                            Delete
                          </Menu.Item>
                          <Menu.Item
                            className="px-3 py-1 text-left rounded-md hover:bg-gray-100"
                            as="button"
                          >
                            Edit
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
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
