import React from "react";
import { cn } from "./utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-[var(--color-border)] opacity-70",
        className
      )}
      {...props}
    />
  );
};
