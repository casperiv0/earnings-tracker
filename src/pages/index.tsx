import Chart from "components/chart/Chart";
import { trpc } from "utils/trpc";

export default function Index() {
  const dashboardQuery = trpc.useQuery(["dashboard.all-infinite"]);

  return (
    <div className="m-8 mx-10 h-full">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between w-full mb-5 gap-y-3">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-serif">Dashboard</h1>
          <p className="mt-2 font-medium">Welcome back!</p>
        </div>
      </header>

      {/* todo: allow selecting year */}
      <section>todo: add more information here</section>

      <Chart
        expenses={dashboardQuery.data?.expenses ?? []}
        income={dashboardQuery.data?.income ?? []}
      />
    </div>
  );
}
