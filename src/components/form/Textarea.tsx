import * as React from "react";

type Props = Omit<JSX.IntrinsicElements["textarea"], "id"> & {
  errorMessage?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ errorMessage, ...rest }, ref) => (
    <textarea
      ref={ref}
      {...rest}
      className={`
    w-full p-1.5 px-3 rounded-md border-[1.5px] max-h-[650px]
    outline-none focus:border-gray-500
    bg-secondary text-white
    disabled:cursor-not-allowed disabled:opacity-80
    placeholder:opacity-50
    transition-colors ${rest.className} ${
        errorMessage ? "border-red-500 focus:border-red-700" : "border-gray-600"
      } `}
    />
  ),
);
