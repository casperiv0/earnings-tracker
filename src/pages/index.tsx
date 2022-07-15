import * as React from "react";
import Chart, { getMonths, getTotalForMonth, makeDifference, sum } from "components/chart/Chart";
import { trpc } from "utils/trpc";
import type { Expense } from "./expenses";
import type { Income } from "./income";
import { IncomeType } from "@prisma/client";
import { Dropdown } from "components/dropdown/Dropdown";
import { Button } from "components/ui/Button";
import { PageHeader } from "components/ui/PageHeader";

const YEARS = [2022, 2021, 2020, 2019, 2018];

export default function Index() {
  const [year, setYear] = React.useState(() => new Date().getFullYear());

  const dashboardQuery = trpc.useQuery(["dashboard.all-infinite", year]);

  const income = dashboardQuery.data?.income ?? [];
  const expenses = dashboardQuery.data?.expenses ?? [];

  return (
    <div className="m-8 mx-5 md:mx-10 h-full">
      <PageHeader title="Dashboard" description="Welcome Back!" />

      {/* todo: allow selecting year */}
      <div className="flex flex-col gap-y-2">
        <div className="bg-secondary p-5 rounded-sm shadow-md">
          <Dropdown
            alignOffset={0}
            trigger={<Button className="font-semibold text-2xl mb-2 font-serif">{year}</Button>}
          >
            {YEARS.map((year) => (
              <Dropdown.Item key={year} onClick={() => setYear(year)}>
                {year}
              </Dropdown.Item>
            ))}
          </Dropdown>

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
            <span className="font-semibold">Total Netto:</span>{" "}
            <span className="font-mono">{getTotalDifference(expenses, income)}</span>
          </p>
          <p>
            <span className="font-semibold">Average income per month:</span>{" "}
            <span className="font-mono">{getAverageIncomePerMonth(income)}</span>
          </p>
        </div>

        <Chart selectedYear={year} expenses={expenses} income={income} />
      </div>
    </div>
  );
}

export function getTotal(data: (Income | Expense)[]) {
  const total = sum(...data.map((item) => item.amount)).toFixed(2);
  return `${total} EUR`;
}

export function getTotalDifference(expenses: Expense[], income: Income[]) {
  const total = makeDifference(income, expenses);
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
