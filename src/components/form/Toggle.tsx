import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { classNames } from "utils/classNames";

type ButtonProps = JSX.IntrinsicElements["button"];

interface Props extends Omit<ButtonProps, "value"> {
  name: string;
  value: boolean;
  onChange(value: any): void;
}

export const Toggle = React.forwardRef<HTMLButtonElement, Props>(
  ({ value, onChange: onCheckedChange, name, ...props }, ref) => {
    return (
      <SwitchPrimitive.Root
        onCheckedChange={() => onCheckedChange({ target: { name, value: !value } })}
        id={name}
        {...props}
        ref={ref}
        name={name}
        checked={value}
        className={classNames(
          "relative h-6 transition-all rounded-full shadow-sm min-w-[44px] w-11 disabled:opacity-50 disabled:cursor-not-allowed",
          value ? "bg-blue-400" : "bg-neutral-600",
        )}
      >
        <SwitchPrimitive.Thumb
          data-state={value ? "checked" : "unchecked"}
          className={classNames(
            "block w-4 h-4 transition-all rounded-full toggle-component",
            "bg-white",
          )}
        />
      </SwitchPrimitive.Root>
    );
  },
);
