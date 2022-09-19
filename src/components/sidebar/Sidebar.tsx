import Link from "next/link";
import { trpc } from "utils/trpc";
import { useRouter } from "next/router";
import { UserArea } from "./UserArea";
import { classNames } from "../../utils/classNames";

const sidebarNavigation = [
  { name: "Dashboard", href: "/" },
  { name: "Expenses", href: "/expenses" },
  { name: "Income", href: "/income" },
  { name: "Subscriptions", href: "/subscriptions" },
  { name: "Settings", href: "/settings" },
];

export function Sidebar() {
  const sessionQuery = trpc.user.getSession.useQuery();
  const user = sessionQuery.data?.user;
  const router = useRouter();

  if (!user) {
    return null;
  }

  return (
    <aside className="hidden md:flex fixed z-30 w-72 flex-shrink-0 min-h-full h-screen flex-col justify-between p-4 bg-secondary">
      <div>
        <header>
          <h1 className="text-neutral-400 text-xs font-semibold uppercase select-none">
            Earnings Tracker
          </h1>
        </header>

        <ul className="mt-5">
          {sidebarNavigation.map((item) => {
            const isCurrent = item.href === router.pathname;

            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    aria-current={isCurrent ? "page" : undefined}
                    className={classNames(
                      "text-base transition-colors my-0.5 flex items-center gap-2 py-1.5 px-4 rounded-sm hover:bg-tertiary hover:text-white",
                      isCurrent
                        ? "bg-tertiary font-semibold text-white"
                        : "border-transparent text-gray-200",
                    )}
                  >
                    <span className="capitalize">{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <UserArea user={user} />
    </aside>
  );
}
