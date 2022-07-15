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
import type { IncomeType, Month } from "@prisma/client";
import { DEFINED_MONTHS } from "utils/constants";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  selectedYear: number;
  expenses: Expense[];
  income: Income[];
}

export function makeDifference(income: Income[], expenses: Expense[]) {
  const _data = [];

  for (const month of DEFINED_MONTHS) {
    const incomeForMonth = income.filter((item) => item.date.month === month);
    const expensesForMonth = expenses.filter((item) => item.date.month === month);

    const incomeSum = sum(...incomeForMonth.map((item) => item.amount));
    const expensesSum = sum(...expensesForMonth.map((item) => item.amount));

    _data.push(incomeSum - expensesSum);
  }

  return _data;
}

export function getTotalForMonth(data: Income[] | Expense[], type?: IncomeType) {
  const _data: Partial<Record<Month, number>> = {};

  for (const m of DEFINED_MONTHS) {
    const month = m as Month;
    const filtered = data.filter((item) => item.date.month === month) as Income[] | Expense[];
    _data[month] = 0;

    for (const item of filtered) {
      const current = _data[item.date.month];
      if (type && "type" in item && item.type !== type) continue;

      _data[item.date.month] = current ? item.amount + current : item.amount;
    }
  }

  return Object.values(_data);
}

export function getMonths(expenses: Expense[], income: Income[]) {
  const months = [...new Set([...expenses, ...income].map((e) => e.date.month))];
  return months;
}

export default function Chart({ selectedYear, expenses, income }: Props) {
  const monthLabels = React.useMemo(() => {
    const date = new Date();
    const isCurrentYear = date.getFullYear() === selectedYear;
    const currentMonth = new Date().getMonth();

    if (isCurrentYear) {
      return DEFINED_MONTHS.slice(0, currentMonth + 1);
    }

    return DEFINED_MONTHS;
  }, [selectedYear]);

  const chartData: ChartData<"line"> = {
    labels: monthLabels,
    datasets: [
      {
        label: "# Income",
        data: getTotalForMonth(income),
        fill: true,
        backgroundColor: "rgb(59 130 246)",
        borderColor: "rgb(59 130 246)",
      },
      {
        label: "# Expenses",
        data: getTotalForMonth(expenses),
        fill: true,
        backgroundColor: "rgb(185 28 28)",
        borderColor: "rgb(185 28 28)",
      },
      {
        label: "# Difference",
        data: makeDifference(income, expenses),
        fill: true,
        backgroundColor: "rgb(22 163 74)",
        borderColor: "rgb(22 163 74)",
      },
    ],
  };

  return (
    <Line
      className="bg-secondary p-5 rounded-sm shadow-md"
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
