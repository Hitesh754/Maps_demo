import React from "react";
import { cn } from "./utils";
import { Surface } from "./Surface";

export interface FloatingBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FloatingBar = React.forwardRef<HTMLDivElement, FloatingBarProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        elevation="level2"
        bordered
        className={cn(
          "inline-flex items-center gap-1.5 p-1 rounded-lg backdrop-blur-md bg-opacity-90 dark:bg-opacity-90",
          className
        )}
        {...props}
      >
        {children}
      </Surface>
    );
  }
);

FloatingBar.displayName = "FloatingBar";
