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
import { DEFINED_MONTHS } from "utils/constants";
import { getMonths, getNettoPerMonth, getTotalPerMonth } from "utils/chart-utils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
        label: "# Bruto",
        data: getTotalPerMonth({ data: income, months: monthLabels, selectedYear }),
        backgroundColor: "rgb(59 130 246)",
        borderColor: "rgb(59 130 246)",
      },
      {
        label: "# Spendings",
        data: getTotalPerMonth({ data: expenses, months: monthLabels, selectedYear }),
        fill: true,
        backgroundColor: "rgb(185 28 28)",
        borderColor: "rgb(185 28 28)",
      },
      {
        label: "# Netto",
        data: getNettoPerMonth({ income, expenses, selectedYear, months: monthLabels }),
        fill: true,
        backgroundColor: "rgb(22 163 74)",
        borderColor: "rgb(22 163 74)",
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
