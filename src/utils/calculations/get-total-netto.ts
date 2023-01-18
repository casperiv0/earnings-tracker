import { getMonths, sum } from "utils/chart-utils";
import { getNettoPerMonth } from "./get-netto-per-month";
import type { Expense } from "src/pages/expenses";
import type { Income } from "src/pages/income";

export interface GetTotalNettoOptions {
  income: Income[];
  expenses: Expense[];
  selectedYear: number | "all-time";
}

export function getTotalNetto(options: GetTotalNettoOptions) {
  const months = getMonths({ data: [...options.income, ...options.expenses], ...options });
  const total = getNettoPerMonth({ ...options, months });

  return sum(...total);
}
