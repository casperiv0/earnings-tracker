import type { User } from "@prisma/client";
import { Button } from "components/Button";
import { Dropdown } from "components/dropdown/Dropdown";
import { signOut } from "next-auth/react";

interface Props {
  user: Pick<User, "id" | "email" | "imageUrl" | "name">;
}

export function UserArea({ user }: Props) {
  const trigger = (
    <Button className="text-left cursor-pointer flex items-center px-0 bg-transparent">
      <div className="flex-shrink-0 h-10">
        <img
          draggable={false}
          className="h-10 w-10 rounded-full"
          src={user.imageUrl!}
          alt={user.email}
          width={40}
          height={40}
          loading="lazy"
        />
      </div>
      <div className="ml-3">
        <div className="text-base font-medium text-neutral-200">{user.name}</div>
        <div className="text-sm font-medium leading-none text-neutral-400">{user.email}</div>
      </div>
    </Button>
  );

  return (
    <Dropdown alignOffset={0} sideOffset={10} trigger={trigger}>
      <Dropdown.Item
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full text-left cursor-pointer px-3 p-1.5 rounded-sm transition-colors"
      >
        Sign out
      </Dropdown.Item>
    </Dropdown>
  );
}
