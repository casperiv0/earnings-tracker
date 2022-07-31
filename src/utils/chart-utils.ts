import type { IncomeType } from "@prisma/client";
import type { Expense } from "src/pages/expenses";
import type { Income } from "src/pages/income";

interface GetTotalForMonthOptions {
  data: (Income | Expense)[];
  months: string[];
  selectedYear: number | "all-time";
  type?: IncomeType;
}

export function createKeyFunc(selectedYear: number | "all-time", item: Income | Expense) {
  if (selectedYear === "all-time") {
    return `${item.date.year}-${item.date.month}`;
  }
  return item.date.month;
}

export function getMonths(options: Pick<GetTotalForMonthOptions, "data" | "selectedYear">) {
  const monthSet = new Set(options.data.map((item) => createKeyFunc(options.selectedYear, item)));
  const months = [...monthSet].sort((a, b) => parseInt(a) - parseInt(b));

  return months;
}

export function getTotalPerMonth(options: GetTotalForMonthOptions) {
  const _data: Partial<Record<string, number>> = {};

  for (const monthAndYear of options.months) {
    const filtered = options.data.filter(
      (item) => createKeyFunc(options.selectedYear, item) === monthAndYear,
    );

    if (filtered.length <= 0) {
      _data[monthAndYear] = 0;
      continue;
    }

    for (const item of filtered) {
      if (options.type && "type" in item && item.type !== options.type) continue;
      const itemKey = createKeyFunc(options.selectedYear, item);
      const current = _data[itemKey];

      _data[itemKey] = current ? item.amount + current : item.amount;
    }
  }

  return Object.values(_data) as number[];
}

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

export function sum(...num: number[]) {
  return num.reduce((ac, cv) => ac + cv, 0);
}
