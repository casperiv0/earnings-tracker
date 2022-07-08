import * as React from "react";
import { classNames } from "./sidebar/Sidebar";

export type ButtonProps = JSX.IntrinsicElements["button"] & {
  size?: keyof typeof buttonSizes;
  variant?: keyof typeof buttonVariants | null;
};

export const buttonVariants = {
  default: "bg-quaternary enabled:hover:brightness-110 transition shadow-sm text-white",
};

export const buttonSizes = {
  xs: "p-0.5 px-2",
  sm: "p-1 px-4",
  lg: "p-2 px-6",
} as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "sm", className = "", ...rest }, ref) => (
    <button
      className={classNames(
        "rounded-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed",
        buttonSizes[size],
        variant && buttonVariants[variant],
        className,
      )}
      {...rest}
      ref={ref}
    />
  ),
);