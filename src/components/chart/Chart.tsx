import * as React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js";
import type { Expense } from "src/pages/expenses";
import type { Income } from "src/pages/income";
import type { Month } from "@prisma/client";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  expenses: Expense[];
  income: Income[];
}

function makeDifference(months: Month[], income: Income[], expenses: Expense[]) {
  const _data = [];

  for (const month of months) {
    const incomeForMonth = income.filter((item) => item.date.month === month);
    const expensesForMonth = expenses.filter((item) => item.date.month === month);

    const incomeSum = sum(...incomeForMonth.map((item) => item.amount));
    const expensesSum = sum(...expensesForMonth.map((item) => item.amount));

    _data.push(incomeSum - expensesSum);
  }

  return _data;
}

function makeTotalForMonth(data: Income[] | Expense[]) {
  const _data: Partial<Record<Month, number>> = {};

  for (const item of data) {
    const current = _data[item.date.month];
    _data[item.date.month] = current ? item.amount + current : item.amount;
  }

  return Object.values(_data);
}

export default function Chart({ expenses, income }: Props) {
  const months = [...new Set([...expenses, ...income].map((e) => e.date.month))];

  const chartData: ChartData<"line"> = {
    labels: months.map((month) => month),
    datasets: [
      {
        label: "# Income",
        data: makeTotalForMonth(income),
        fill: false,
        backgroundColor: "rgb(59 130 246)",
        borderColor: "rgb(59 130 246)",
      },
      {
        label: "# Expenses",
        data: makeTotalForMonth(expenses),
        fill: false,
        backgroundColor: "rgb(185 28 28)",
        borderColor: "rgb(185 28 28)",
      },
      {
        label: "# Difference",
        data: makeDifference(months, income, expenses),
        fill: false,
        backgroundColor: "rgb(22 163 74)",
        borderColor: "rgb(22 163 74)",
      },
    ],
  };

  return (
    <Line
      className="bg-secondary p-5 rounded-sm"
      options={{
        color: "white",
        responsive: true,
        interaction: {
          mode: "index",
          intersect: false,
        },
      }}
      data={chartData}
    />
  );
}

export function sum(...num: number[]) {
  return num.reduce((ac, cv) => ac + cv, 0);
}
