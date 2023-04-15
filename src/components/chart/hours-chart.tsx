import * as React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  Filler,
  BarElement,
} from "chart.js";
import { DEFINED_MONTHS } from "utils/constants";
import { createKeyFunc, getMonths } from "utils/chart-utils";
import type { Hour } from "src/pages/hours";
import { random } from "uniqolor";
import type { Month } from "@prisma/client";

ChartJS.register(
  BarElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);

interface Props {
  selectedYear: number | "all-time";
  hours: Hour[];
}

const randomColors = Array.from({ length: 10 }, () =>
  random({ format: "rgb", differencePoint: 2 }),
);

export function HoursChart({ selectedYear, hours }: Props) {
  const monthLabels = React.useMemo(() => {
    const date = new Date();
    const isCurrentYear = date.getFullYear() === selectedYear;
    const currentMonth = new Date().getMonth();

    if (isCurrentYear) return DEFINED_MONTHS.slice(0, currentMonth + 1);
    if (selectedYear === "all-time") {
      return getMonths({ data: hours, selectedYear });
    }

    return DEFINED_MONTHS;
  }, [selectedYear, hours]);

  const datasets = React.useMemo(() => {
    const tags = [...new Set(hours.map((hour) => hour.tag).filter(Boolean))] as string[];
    return tags.map((data, idx) => {
      const filteredHours = hours.filter((hour) => hour.tag === data);
      const color = randomColors[idx] ?? random({ format: "rgb" });

      const monthsData: { month: Month; amount: number }[] = [];

      for (const month of monthLabels) {
        const filteredHoursByMonth = filteredHours.filter(
          (hour) => createKeyFunc(selectedYear, hour) === month,
        );
        const amount = filteredHoursByMonth.reduce((acc, hour) => acc + hour.amount, 0);

        monthsData.push({ month: month as Month, amount });
      }

      return {
        label: data,
        data: monthsData.map((v) => v.amount),
        fill: false,
        backgroundColor: color.color,
        borderColor: color.color,
      };
    });
  }, [hours, monthLabels, selectedYear]);

  const chartData: ChartData<"bar"> = {
    labels: monthLabels,
    datasets,
  };

  if (hours.length <= 0) {
    return (
      <div className="bg-secondary p-5 rounded-sm shadow-md h-[500px]">No data to display</div>
    );
  }

  return (
    <div className="h-[500px]">
      <Bar
        className="bg-secondary p-5 rounded-sm shadow-md"
        options={{
          maintainAspectRatio: false,
          normalized: true,
          color: "white",
          responsive: true,
        }}
        data={chartData}
      />
    </div>
  );
}
