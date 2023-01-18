import { IncomeType } from "@prisma/client";
import { getMonths, sum } from "utils/chart-utils";
import { getTotalPerMonth } from "./get-total-per-month";
import type { Income } from "src/pages/income";

export interface GetTotalSalaryOptions {
  income: Income[];
  selectedYear: number | "all-time";
}

export function getTotalSalary(options: GetTotalSalaryOptions) {
  const months = getMonths({ data: options.income, ...options });
  const total = sum(
    ...getTotalPerMonth({
      data: options.income,
      selectedYear: options.selectedYear,
      type: IncomeType.Salary,
      months,
    }),
  );

  return total;
}
