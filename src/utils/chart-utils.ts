import type { Expense } from "src/_pages/expenses";
import type { Hour } from "src/_pages/hours";
import type { Income } from "src/_pages/income";
import type { GetTotalForMonthOptions } from "./calculations/get-total-per-month";

export function createKeyFunc(selectedYear: number | "all-time", item: Income | Expense | Hour) {
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

export function sum(...num: number[]) {
  return num.reduce((ac, cv) => ac + cv, 0);
}

export const NUMBER_FORMATTER = new Intl.NumberFormat("NL-be", { compactDisplay: "short" });
