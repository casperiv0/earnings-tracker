import * as React from "react";
import { Chart } from "components/chart/chart";
import { trpc } from "utils/trpc";
import { Dropdown } from "components/dropdown/Dropdown";
import { Button } from "components/ui/Button";
import { PageHeader } from "components/ui/PageHeader";
import { DEFINED_YEARS } from "utils/constants";
import { EarningsPieChart } from "components/chart/earnings-pie-chart";
import { HoursPieChart } from "components/chart/hours-pie-chart";
import { getTotal } from "utils/calculations/get-total";
import { getTotalNetto } from "utils/calculations/get-total-netto";
import { getTotalSalary } from "utils/calculations/get-salary-total";
import { HoursChart } from "components/chart/hours-chart";

const SORTED_YEARS = [...DEFINED_YEARS].sort((a, b) => b - a);
const NUMBER_FORMATTER = new Intl.NumberFormat("NL-be", { compactDisplay: "short" });

export default function Index() {
  const [selectedYear, setSelectedYear] = React.useState<number | "all-time">(() =>
    new Date().getFullYear(),
  );

  const user = trpc.user.getSession.useQuery();
  const dashboardQuery = trpc.dashboard.getDashboardData.useQuery(selectedYear);

  const income = dashboardQuery.data?.income ?? [];
  const expenses = dashboardQuery.data?.expenses ?? [];
  const hours = dashboardQuery.data?.hours ?? [];

  const totalIncome = getTotal(income);
  const totalExpenses = getTotal(expenses);
  const totalHours = getTotal(hours);

  const totalNetto = getTotalNetto({ expenses, income, selectedYear });
  const salaryIncome = getTotalSalary({ income, selectedYear });
  const configuration = user.data?.user?.configuration;

  return (
    <div className="m-8 mx-5 md:mx-10 h-full">
      <PageHeader title="Dashboard" description="Welcome Back!">
        <Dropdown
          side="left"
          alignOffset={0}
          trigger={
            <Button className="font-semibold text-2xl mb-2 font-serif">{selectedYear}</Button>
          }
        >
          <Dropdown.Item key={selectedYear} onClick={() => setSelectedYear("all-time")}>
            All Time
          </Dropdown.Item>
          {SORTED_YEARS.map((year) => (
            <Dropdown.Item key={year} onClick={() => setSelectedYear(year)}>
              {year}
            </Dropdown.Item>
          ))}
        </Dropdown>
      </PageHeader>

      <div className="flex flex-col gap-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <Card name="Total Income" amount={totalIncome} />
          <Card name="Total Netto" amount={totalNetto} />
          <Card name="Total Expenses" amount={totalExpenses} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Card
            max={configuration?.maxYearlyIncome}
            name="Total Salary Income"
            amount={salaryIncome}
          />
          <Card
            max={configuration?.maxYearlyHours}
            showCurrency={false}
            name="Total Hours"
            amount={totalHours}
          />
        </div>

        <Chart selectedYear={selectedYear} expenses={expenses} income={income} />
        <HoursChart selectedYear={selectedYear} hours={hours} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <EarningsPieChart selectedYear={selectedYear} expenses={expenses} income={income} />
          <HoursPieChart hours={hours} />
        </div>
      </div>
    </div>
  );
}

function Card({
  name,
  amount,
  showCurrency = true,
  max,
}: {
  name: string;
  amount: number;
  showCurrency?: boolean;
  max?: number | null;
}) {
  return (
    <div className="bg-secondary p-5 rounded-sm shadow-md w-full flex flex-col">
      <h3 className="font-semibold uppercase text-sm mb-2 font-serif text-neutral-300">{name}</h3>
      <span className="font-mono text-2xl font-semibold">
        {showCurrency ? <>&euro;</> : null}
        {NUMBER_FORMATTER.format(amount)}
        {max ? <span className="inline-block text-sm ml-2">/ {max}</span> : null}
      </span>
    </div>
  );
}
