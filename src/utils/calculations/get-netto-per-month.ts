import type { Expense } from "src/_pages/expenses";
import type { Income } from "src/_pages/income";
import { createKeyFunc, sum } from "utils/chart-utils";

interface GetNettoPerMonthOptions {
  income: Income[];
  expenses: Expense[];
  months: string[];
  selectedYear: number | "all-time";
}

export function getNettoPerMonth(options: GetNettoPerMonthOptions) {
  const _data = [];

  for (const monthAndYear of options.months) {
    const incomeForMonth = options.income.filter(
      (item) => createKeyFunc(options.selectedYear, item) === monthAndYear,
    );
    const expensesForMonth = options.expenses.filter(
      (item) => createKeyFunc(options.selectedYear, item) === monthAndYear,
    );

    const incomeSum = sum(...incomeForMonth.map((item) => item.amount));
    const expensesSum = sum(...expensesForMonth.map((item) => item.amount));

    _data.push(incomeSum - expensesSum);
  }

  return _data;
}
