import * as React from "react";
import Chart from "components/chart/Chart";
import { trpc } from "utils/trpc";
import type { Expense } from "./expenses";
import type { Income } from "./income";
import { IncomeType } from "@prisma/client";
import { Dropdown } from "components/dropdown/Dropdown";
import { Button } from "components/ui/Button";
import { PageHeader } from "components/ui/PageHeader";
import { getTotalPerMonth, getMonths, getNettoPerMonth, sum } from "utils/chart-utils";
import { DEFINED_YEARS } from "utils/constants";

const SORTED_YEARS = [...DEFINED_YEARS].sort((a, b) => b - a);

export default function Index() {
  const [year, setYear] = React.useState<number | "all-time">(() => new Date().getFullYear());

  const dashboardQuery = trpc.dashboard.getDashboardData.useQuery(year);
  const NUMBER_FORMATTER = new Intl.NumberFormat("be-NL", { compactDisplay: "short" });

  const income = dashboardQuery.data?.income ?? [];
  const expenses = dashboardQuery.data?.expenses ?? [];

  return (
    <div className="m-8 mx-5 md:mx-10 h-full">
      <PageHeader title="Dashboard" description="Welcome Back!" />

      <div className="flex flex-col gap-y-2">
        <div className="bg-secondary p-5 rounded-sm shadow-md">
          <Dropdown
            alignOffset={0}
            trigger={<Button className="font-semibold text-2xl mb-2 font-serif">{year}</Button>}
          >
            <Dropdown.Item key={year} onClick={() => setYear("all-time")}>
              All Time
            </Dropdown.Item>
            {SORTED_YEARS.map((year) => (
              <Dropdown.Item key={year} onClick={() => setYear(year)}>
                {year}
              </Dropdown.Item>
            ))}
          </Dropdown>

          <p>
            <span className="font-semibold">Total Netto:</span>{" "}
            <span className="font-mono">
              &euro;{NUMBER_FORMATTER.format(getTotalDifference(expenses, income, year))}
            </span>
          </p>
          <p>
            <span className="font-semibold">Total Income:</span>{" "}
            <span className="font-mono">&euro;{NUMBER_FORMATTER.format(getTotal(income))}</span>
          </p>
          <p>
            <span className="font-semibold">Total Salary income:</span>{" "}
            <span className="font-mono">
              &euro;{NUMBER_FORMATTER.format(getTotalSalaryThisYear(income, year))}
            </span>
          </p>
          <p>
            <span className="font-semibold">Total Expenses:</span>{" "}
            <span className="font-mono">&euro;{NUMBER_FORMATTER.format(getTotal(expenses))}</span>
          </p>
          <p>
            <span className="font-semibold">Average income per month:</span>{" "}
            <span className="font-mono">
              &euro;{NUMBER_FORMATTER.format(getAverageIncomePerMonth(income, year))}
            </span>
          </p>
        </div>

        <Chart selectedYear={year} expenses={expenses} income={income} />
      </div>
    </div>
  );
}

export function getTotal(data: (Income | Expense)[]) {
  const total = sum(...data.map((item) => item.amount));
  return total;
}

export function getTotalDifference(
  expenses: Expense[],
  income: Income[],
  selectedYear: number | "all-time",
) {
  const months = getMonths({ data: [...income, ...expenses], selectedYear });
  const total = getNettoPerMonth({ income, expenses, selectedYear, months });

  return sum(...total);
}

export function getAverageIncomePerMonth(income: Income[], selectedYear: number | "all-time") {
  const months = getMonths({ data: income, selectedYear });
  const total = sum(...getTotalPerMonth({ data: income, months, selectedYear }));

  return total / months.length;
}

function getTotalSalaryThisYear(income: Income[], selectedYear: number | "all-time") {
  const months = getMonths({ data: income, selectedYear });
  const total = sum(
    ...getTotalPerMonth({ data: income, type: IncomeType.Salary, selectedYear, months }),
  );

  return total;
}
