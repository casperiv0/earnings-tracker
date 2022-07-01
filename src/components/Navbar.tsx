import * as React from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { trpc } from "utils/trpc";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

const navigation = [{ name: "Dashboard", href: "/" }];

const userNavigation = [
  { name: "Account", as: "a", href: "/account" },
  { name: "Settings", as: "a", href: "#" },
  { name: "Sign out", as: "button", onClick: () => signOut({ redirect: true }) },
];

function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(" ");
}

export function Navbar() {
  const sessionQuery = trpc.useQuery(["user.getSession"], { ssr: false });
  const user = sessionQuery.data?.user;
  const router = useRouter();

  if (!user) {
    return null;
  }

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <ul className="flex items-baseline space-x-4">
                  {navigation.map((item) => {
                    const isCurrent = item.href === router.pathname;

                    return (
                      <li key={item.name}>
                        <Link href={item.href}>
                          <a
                            className={classNames(
                              isCurrent
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "px-3 py-2 rounded-md text-sm font-medium",
                            )}
                            aria-current={isCurrent ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="hidden md:block">
                {/* profile dropdown */}
                <Menu as="div" className="ml-3 relative">
                  <div>
                    <Menu.Button className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.imageUrl ?? ""}
                        alt={user.email}
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={React.Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {userNavigation.map((item) => (
                        <Menu.Item
                          onClick={item.onClick}
                          className={classNames(
                            "text-left block w-full cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                          )}
                          as={item.as as React.ElementType}
                          key={item.name}
                        >
                          {item.name}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className="-mr-2 flex md:hidden">
                <Disclosure.Button className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user.imageUrl ?? "h"}
                    alt={user.email}
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user.name}</div>
                  <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                {userNavigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={item.as as React.ElementType}
                    onClick={item.onClick}
                    className="cursor-pointer w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
