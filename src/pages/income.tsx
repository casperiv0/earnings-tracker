import { trpc } from "utils/trpc";

export default function IncomePage() {
  // const expensesQuery = trpc.useInfiniteQuery(
  //   [
  //     "expenses.all-infinite",
  //     {
  //       limit: 10,
  //     },
  //   ],
  //   {
  //     getNextPageParam: (lastPage) => lastPage.cursor,
  //   },
  // );

  // console.log(expensesQuery.data);

  return (
    <div className="p-10 w-full">
      <header className="border-b-2 border-gray-300 flex items-center justify-between w-full pb-3">
        <h1 className="text-2xl font-semibold">Income</h1>

        <div>
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm text-white rounded-md">
            Add new income
          </button>
        </div>
      </header>
    </div>
  );
}
