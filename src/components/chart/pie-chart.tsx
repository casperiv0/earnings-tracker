import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, type ChartData, ArcElement } from "chart.js";
import type { Expense } from "src/pages/expenses";
import type { Income } from "src/pages/income";
import { GRAPH_COLORS } from "utils/constants";
import { getTotal } from "utils/calculations/get-total";
import { getTotalNetto } from "utils/calculations/get-total-netto";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

interface Props {
  selectedYear: number | "all-time";
  expenses: Expense[];
  income: Income[];
}

export default function PieChart({ selectedYear, expenses, income }: Props) {
  const totalIncome = getTotal(income);
  const totalExpenses = getTotal(expenses);
  const totalNetto = getTotalNetto({ expenses, income, selectedYear });

  const chartData: ChartData<"pie"> = {
    labels: ["Income", "Netto", "Expenses"],
    datasets: [
      {
        label: "# Spendings",
        data: [totalIncome, totalNetto, totalExpenses],

        backgroundColor: [GRAPH_COLORS.INCOME, GRAPH_COLORS.NETTO, GRAPH_COLORS.EXPENSE],
        borderColor: [GRAPH_COLORS.INCOME, GRAPH_COLORS.NETTO, GRAPH_COLORS.EXPENSE],
      },
    ],
  };

  return (
    <div className="h-[500px]">
      <Pie
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
