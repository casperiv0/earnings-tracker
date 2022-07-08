import type * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button, ButtonProps } from "components/Button";
import { classNames } from "components/sidebar/Sidebar";

interface Props extends DropdownMenu.MenuContentProps {
  trigger: any;
  children: React.ReactNode;
  extra?: { maxWidth?: number };
}

export function Dropdown({ trigger, children, extra, ...rest }: Props) {
  const maxWidth = extra?.maxWidth ?? 150;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-1 px-1.5" asChild>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        sideOffset={3}
        alignOffset={5}
        style={{ width: maxWidth, maxWidth }}
        align="start"
        {...rest}
        className={classNames(
          rest.className ?? "dropdown-left",
          "z-50 p-1.5 rounded-sm shadow-lg dropdown-fade w-36 bg-tertiary",
        )}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

Dropdown.Item = function DropdownItem({ children, ...rest }: Omit<ButtonProps, "ref">) {
  return (
    <DropdownMenu.Item asChild>
      <Button
        variant="dropdown"
        {...rest}
        className={classNames(
          "my-0.5 rounded-sm transition-colors w-full text-left",
          rest.className,
        )}
      >
        {children}
      </Button>
    </DropdownMenu.Item>
  );
};
