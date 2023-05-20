import { serverApi } from "~/utils/trpc/server";
import { ExpensesHeader } from "./components/header";
import { ExpensesTableList } from "./components/list";

export default async function ExpensesPage() {
  const expenses = await serverApi.expenses.getInfinitelyScrollableExpenses.query({
    page: 0,
    sorting: [],
    filters: [],
  });

  console.log(expenses);

  return (
    <div className="m-8 mx-5 md:mx-10 h-full">
      <ExpensesHeader />
      <ExpensesTableList query={expenses} />
    </div>
  );
}
