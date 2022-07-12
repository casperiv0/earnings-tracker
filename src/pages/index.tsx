import * as React from "react";
import Chart, { getMonths, getTotalForMonth, makeDifference, sum } from "components/chart/Chart";
import { trpc } from "utils/trpc";
import type { Expense } from "./expenses";
import type { Income } from "./income";
import { IncomeType } from "@prisma/client";

export default function Index() {
  const [year, setYear] = React.useState(() => new Date().getFullYear());

  const dashboardQuery = trpc.useQuery(["dashboard.all-infinite", year]);

  const income = dashboardQuery.data?.income ?? [];
  const expenses = dashboardQuery.data?.expenses ?? [];

  return (
    <div className="m-8 mx-10 h-full">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between w-full mb-5 gap-y-3">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-serif">Dashboard</h1>
          <p className="mt-2 font-medium">Welcome back!</p>
        </div>
      </header>

      {/* todo: allow selecting year */}
      <div className="flex flex-col gap-y-2">
        <div className="bg-secondary p-5 rounded-sm shadow-md">
          <h2 onClick={() => setYear(2021)} className="font-semibold text-2xl mb-2 font-serif">
            {year}
          </h2>

          <p>
            <span className="font-semibold">Total Income:</span>{" "}
            <span className="font-mono">{getTotal(income)}</span>
          </p>
          <p>
            <span className="font-semibold">Total Salary income:</span>{" "}
            <span className="font-mono">{getTotalSalaryThisYear(income)}</span>
          </p>
          <p>
            <span className="font-semibold">Total Expenses:</span>{" "}
            <span className="font-mono">{getTotal(expenses)}</span>
          </p>
          <p>
            <span className="font-semibold">
              Total Difference <span className="text-sm">(Inc. - Exp.)</span>:
            </span>{" "}
            <span className="font-mono">{getTotalDifference(expenses, income)}</span>
          </p>
          <p>
            <span className="font-semibold">Average income per month:</span>{" "}
            <span className="font-mono">{getAverageIncomePerMonth(income)}</span>
          </p>
        </div>

        <Chart expenses={expenses} income={income} />
      </div>
    </div>
  );
}

export function getTotal(data: (Income | Expense)[]) {
  const total = sum(...data.map((item) => item.amount)).toFixed(2);
  return `${total} EUR`;
}

export function getTotalDifference(expenses: Expense[], income: Income[]) {
  const months = getMonths(expenses, income);
  const total = makeDifference(months, income, expenses);
  return sum(...total).toFixed(2);
}

export function getAverageIncomePerMonth(income: Income[]) {
  const total = sum(...getTotalForMonth(income));
  const months = getMonths([], income);

  return `${(total / months.length).toFixed(2)} EUR`;
}

function getTotalSalaryThisYear(income: Income[]) {
  const total = sum(...getTotalForMonth(income, IncomeType.Salary));

  return `${total.toFixed(2)} EUR`;
}
