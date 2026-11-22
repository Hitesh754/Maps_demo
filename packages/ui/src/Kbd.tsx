import React from "react";
import { cn } from "./utils";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Kbd: React.FC<KbdProps> = ({ children, className, ...props }) => {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center font-mono text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border border-[var(--color-border-muted)] bg-[var(--color-level2)] text-[var(--color-text-secondary)] shadow-xs select-none",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
};
