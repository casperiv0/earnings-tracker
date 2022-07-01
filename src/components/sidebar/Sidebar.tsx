import Link from "next/link";
import { CogIcon, HomeIcon, FolderRemoveIcon, ReceiptTaxIcon } from "@heroicons/react/outline";
import { trpc } from "utils/trpc";
import { useRouter } from "next/router";
import { UserArea } from "./UserArea";

const sidebarNavigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Expenses", href: "/expenses", icon: FolderRemoveIcon },
  { name: "Income", href: "/income", icon: ReceiptTaxIcon },
  { name: "Settings", href: "/settings", icon: CogIcon },
];

export function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar() {
  const sessionQuery = trpc.useQuery(["user.getSession"], { ssr: false });
  const user = sessionQuery.data?.user;

  const router = useRouter();

  if (!user) {
    return null;
  }

  return (
    <aside className="fixed z-50 w-72 flex-shrink-0 min-h-full h-screen flex flex-col justify-between py-4 bg-white border-r-[1.5px]">
      <div>
        <header className="px-4">
          <h1 className="text-black">LOGO</h1>
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
                      "transition-colors my-0.5 flex items-center gap-2 border-l-4 py-2 px-4 hover:border-indigo-600 hover:bg-indigo-300/20 hover:text-indigo-800",
                      isCurrent
                        ? "border-indigo-600 bg-indigo-300/20 text-indigo-800 font-semibold"
                        : "border-transparent text-black",
                    )}
                  >
                    <item.icon className="block h-5 w-5" aria-hidden="true" />
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
