import React from "react";
import { cn } from "./utils";

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children, className, ...props }) => {
  return (
    <span
      className={cn(
        "absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
