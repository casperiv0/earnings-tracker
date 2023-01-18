import type { IncomeType } from "@prisma/client";
import type { Expense } from "src/pages/expenses";
import type { Income } from "src/pages/income";
import { createKeyFunc } from "utils/chart-utils";

export interface GetTotalForMonthOptions {
  data: (Income | Expense)[];
  months: string[];
  selectedYear: number | "all-time";
  type?: IncomeType;
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
