import { sum } from "utils/chart-utils";
import type { Expense, ProcessedExpense } from "src/pages/expenses";
import type { Income } from "src/pages/income";
import type { Hours, IncomeType } from "@prisma/client";
import { isProcessedExpense } from "components/expenses/ExpensesForm";

interface GetTotalOptions {
  data: (Income | Expense | ProcessedExpense | Hours)[];
  type?: IncomeType;
}

export function getTotal(options: GetTotalOptions) {
  const filtered = options.data.filter((item) => {
    if (options.type && "type" in item) {
      return item.type === options.type;
    }

    return true;
  });

  const total = sum(
    ...filtered.map((item) => (isProcessedExpense(item) ? item.totalAmount : item.amount)),
  );
  return total;
}
