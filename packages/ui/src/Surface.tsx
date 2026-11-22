import React from "react";
import { cn } from "./utils";

export type SurfaceElevation = "level0" | "level1" | "level2" | "level3";

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: SurfaceElevation;
  bordered?: boolean;
}

const elevationClasses: Record<SurfaceElevation, string> = {
  level0: "bg-[var(--color-level0)] shadow-none",
  level1: "bg-[var(--color-level1)] shadow-[var(--shadow-level1)]",
  level2: "bg-[var(--color-level2)] shadow-[var(--shadow-level2)]",
  level3: "bg-[var(--color-level3)] shadow-[var(--shadow-level3)]"
};

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ elevation = "level1", bordered = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "transition-colors",
          elevationClasses[elevation],
          bordered && "border border-[var(--color-border)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Surface.displayName = "Surface";

export const Panel = Surface;
