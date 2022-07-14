import { classNames } from "utils/classNames";
import * as React from "react";

type Props = Omit<JSX.IntrinsicElements["input"], "id"> & {
  errorMessage?: string;
};

export const Input = React.forwardRef<HTMLInputElement, Props>(({ errorMessage, ...rest }, ref) => {
  return (
    <input
      ref={ref}
      {...rest}
      className={classNames(
        "border-[1.5px] focus:border-gray-500",
        "w-full p-1.5 px-3 rounded-sm outline-none transition-all",
        "bg-secondary text-white",
        "disabled:cursor-not-allowed disabled:opacity-80 placeholder:opacity-50",
        rest.className,
        errorMessage ? "border-red-500 focus:border-red-700" : "border-gray-600",
      )}
    />
  );
});
