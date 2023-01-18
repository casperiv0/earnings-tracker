import * as React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  Filler,
} from "chart.js";
import type { Expense } from "src/pages/expenses";
import type { Income } from "src/pages/income";
import { DEFINED_MONTHS, GRAPH_COLORS } from "utils/constants";
import { getMonths } from "utils/chart-utils";
import { getTotalPerMonth } from "utils/calculations/get-total-per-month";
import { getNettoPerMonth } from "utils/calculations/get-netto-per-month";

ChartJS.register(
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);

interface Props {
  selectedYear: number | "all-time";
  expenses: Expense[];
  income: Income[];
}

export default function Chart({ selectedYear, expenses, income }: Props) {
  const monthLabels = React.useMemo(() => {
    const date = new Date();
    const isCurrentYear = date.getFullYear() === selectedYear;
    const currentMonth = new Date().getMonth();

    if (isCurrentYear) return DEFINED_MONTHS.slice(0, currentMonth + 1);
    if (selectedYear === "all-time") {
      return getMonths({ data: [...expenses, ...income], selectedYear });
    }

    return DEFINED_MONTHS;
  }, [selectedYear, expenses, income]);

  const chartData: ChartData<"line"> = {
    labels: monthLabels,
    datasets: [
      {
        label: "# Expenses",
        data: getTotalPerMonth({ data: expenses, months: monthLabels, selectedYear }),
        fill: true,
        backgroundColor: GRAPH_COLORS.EXPENSE,
        borderColor: GRAPH_COLORS.EXPENSE,
      },
      {
        label: "# Netto",
        data: getNettoPerMonth({ income, expenses, selectedYear, months: monthLabels }),
        fill: true,
        backgroundColor: GRAPH_COLORS.NETTO,
        borderColor: GRAPH_COLORS.NETTO,
      },
      {
        label: "# Income",
        data: getTotalPerMonth({ data: income, months: monthLabels, selectedYear }),
        fill: true,
        backgroundColor: GRAPH_COLORS.INCOME,
        borderColor: GRAPH_COLORS.INCOME,
      },
    ],
  };

  return (
    <div className="h-[500px]">
      <Line
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
  );
}
