import { Disclosure, Transition } from "@headlessui/react";
import type { User } from "@prisma/client";
import { signOut } from "next-auth/react";

interface Props {
  user: Pick<User, "id" | "email" | "imageUrl" | "name">;
}

export function UserArea({ user }: Props) {
  return (
    <Disclosure as="div" className="p-4 justify-end relative">
      {({ open }) => (
        <>
          <Disclosure.Button
            as="button"
            className="text-left cursor-pointer flex items-center px-0"
          >
            <div className="flex-shrink-0">
              <img
                draggable={false}
                className="h-10 w-10 rounded-full"
                src={user.imageUrl}
                alt={user.email}
              />
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-neutral-900">{user.name}</div>
              <div className="text-sm font-medium leading-none text-neutral-700">{user.email}</div>
            </div>
          </Disclosure.Button>

          <Transition
            show={open}
            enter="transition duration-100 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Disclosure.Panel className="absolute -top-full h-full bg-gray-200 p-2 rounded-md overflow-hidden shadow-md w-[87%]">
              <button
                onClick={() => signOut({ redirect: true })}
                className="w-full text-left cursor-pointer px-3 p-1.5 rounded-sm transition-colors hover:bg-gray-300"
              >
                Sign out
              </button>
            </Disclosure.Panel>{" "}
          </Transition>
        </>
      )}
    </Disclosure>
  );
}
