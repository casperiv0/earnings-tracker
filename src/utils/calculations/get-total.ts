import { sum } from "utils/chart-utils";
import type { Expense } from "src/pages/expenses";
import type { Income } from "src/pages/income";

export function getTotal(data: (Income | Expense)[]) {
  const total = sum(...data.map((item) => item.amount));
  return total;
}
