import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button, ButtonProps } from "components/Button";
import { classNames } from "utils/classNames";

interface Props extends DropdownMenu.MenuContentProps {
  triggerKind?: "trigger" | "trigger-item";
  trigger: any;
  children: React.ReactNode;
  extra?: { maxWidth?: number };
}

export function Dropdown({ trigger, triggerKind = "trigger", children, extra, ...rest }: Props) {
  const maxWidth = extra?.maxWidth ?? 150;
  const Trigger = triggerKind === "trigger" ? DropdownMenu.Trigger : DropdownMenu.TriggerItem;

  return (
    <DropdownMenu.Root>
      <Trigger className="flex items-center gap-1 px-1.5" asChild>
        {trigger}
      </Trigger>

      <DropdownMenu.Content
        sideOffset={3}
        alignOffset={5}
        style={{ width: maxWidth, maxWidth }}
        align="start"
        {...rest}
        className={classNames(
          "z-50 p-1.5 rounded-sm shadow-lg dropdown-fade w-36 bg-tertiary",
          rest.className,
        )}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

Dropdown.TriggerItem = React.forwardRef<HTMLDivElement, Omit<ButtonProps, "ref">>((props, ref) => {
  return (
    <DropdownMenu.TriggerItem ref={ref} asChild>
      <Button
        {...props}
        variant="dropdown"
        id="dropdown-trigger-item"
        className={classNames(
          "my-0.5 rounded-sm transition-colors w-full text-left",
          props.className,
        )}
      >
        {props.children}
      </Button>
    </DropdownMenu.TriggerItem>
  );
});

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
