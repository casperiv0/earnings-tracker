import Link from "next/link";
import { CogIcon, HomeIcon } from "@heroicons/react/outline";
import { trpc } from "utils/trpc";
import { useRouter } from "next/router";
import { UserArea } from "./UserArea";

const sidebarNavigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Settings", href: "/settings", icon: CogIcon },
];

function classNames(...classes: unknown[]) {
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
    <aside className="z-50 w-72 flex-shrink-0 min-h-full h-screen flex flex-col justify-between py-4 bg-white border-r-[1.5px]">
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
                      "transition-colors my-0.5 flex items-center gap-2 border-l-4 py-2 px-4 hover:border-sky-500 hover:bg-sky-300/20 hover:text-sky-500",
                      isCurrent
                        ? "border-sky-500 bg-sky-300/20 text-sky-500 font-semibold"
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
