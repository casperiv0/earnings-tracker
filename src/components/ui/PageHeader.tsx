"use client";

import { Dropdown } from "components/dropdown/Dropdown";
import { List } from "react-bootstrap-icons";
import { Button } from "./Button";

interface Props {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children, description }: Props) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between w-full mb-5 gap-y-3">
      <div>
        <div className="flex items-center gap-4">
          <Dropdown
            className="md:hidden"
            alignOffset={0}
            trigger={
              <Button className="md:hidden" size="xxs">
                <List className="w-5 h-5" />
              </Button>
            }
          >
            <Dropdown.Link href="/">Dashboard</Dropdown.Link>
            <Dropdown.Link href="/expenses">Expenses</Dropdown.Link>
            <Dropdown.Link href="/income">Income</Dropdown.Link>
            <Dropdown.Link href="/hours">Hours</Dropdown.Link>
            <Dropdown.Link href="/subscriptions">Subscriptions</Dropdown.Link>
            <Dropdown.Link href="/settings">Settings</Dropdown.Link>
          </Dropdown>
          <h1 className="text-3xl sm:text-4xl font-semibold font-serif">{title}</h1>
        </div>

        <p className="mt-4 font-medium">{description}</p>
      </div>

      <div>{children}</div>
    </header>
  );
}
