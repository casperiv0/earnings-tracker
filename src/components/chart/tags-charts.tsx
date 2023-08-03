import * as React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, type ChartData, ArcElement } from "chart.js";
import { Expense, ProcessedExpense } from "src/pages/expenses";
import { isProcessedExpense } from "components/expenses/ExpensesForm";
import { random } from "uniqolor";
import { NUMBER_FORMATTER } from "src/pages";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

interface Props {
  expenses: (Expense | ProcessedExpense)[];
}

const randomColors = Array.from(
  { length: 10 },
  () => random({ format: "rgb", differencePoint: 2 }).color,
);

export function TagsCharts({ expenses }: Props) {
  const nonProcessedExpenses = expenses.filter(
    (expense) => !isProcessedExpense(expense),
  ) as Expense[];

  const tags = [...new Set(nonProcessedExpenses.map((expense) => expense.tag))];

  const expensesData = tags.map((tag) => {
    const filteredExpenses = nonProcessedExpenses.filter((expense) => expense.tag === tag);
    const sum = filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0);

    return { sum, name: tag || "None" };
  });

  const chartData: ChartData<"bar"> = {
    labels: [...expensesData.map((v) => v.name)],
    datasets: [
      {
        label: "Amount",
        data: [...expensesData.map((e) => e.sum)],
        backgroundColor: randomColors,
        borderColor: randomColors,
      },
    ],
  };

  if (nonProcessedExpenses.length <= 0) {
    return (
      <div className="bg-secondary p-5 rounded-sm shadow-md h-[500px]">No data to display</div>
    );
  }

  return (
    <>
      <div className="h-[500px]">
        <Bar
          title="Expenses by tag"
          className="bg-secondary p-5 rounded-sm shadow-md"
          options={{
            maintainAspectRatio: false,
            normalized: true,
            color: "white",
            responsive: true,
            interaction: {
              mode: "index",
              intersect: false,
            },
          }}
          data={chartData}
        />
      </div>

      <div className="h-[500px] bg-secondary p-5 rounded-sm shadow-sm">
        <ul className="flex flex-col gap-y-3 ">
          {expensesData.map((expense) => {
            const percentage =
              (expense.sum / expensesData.reduce((acc, e) => acc + e.sum, 0)) * 100;

            return (
              <li className="flex items-baseline gap-x-2" key={expense.name}>
                <span className="font-semibold text-lg">{expense.name}:</span>
                <span className="font-mono">&euro;{NUMBER_FORMATTER.format(expense.sum)}</span>
                <span className="font-mono text-sm">({percentage.toFixed(2)}%)</span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
