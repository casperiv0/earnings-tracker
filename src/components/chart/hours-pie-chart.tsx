import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, type ChartData, ArcElement } from "chart.js";
import { GRAPH_COLORS } from "utils/constants";
import type { Hour } from "src/pages/hours";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

interface Props {
  hours: Hour[];
}

export function HoursPieChart({ hours }: Props) {
  const tags = [...new Set(hours.map((hour) => hour.tag).filter(Boolean))];

  const hoursData = tags.map((tag) => {
    const filteredHours = hours.filter((hour) => hour.tag === tag);
    const sum = filteredHours.reduce((acc, hour) => acc + hour.amount, 0);

    return { sum, name: tag };
  });

  const chartData: ChartData<"pie"> = {
    labels: [...hoursData.map((v) => v.name)],
    datasets: [
      {
        label: "Amount (Hours)",
        data: [...hoursData.map((v) => v.sum)],

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
