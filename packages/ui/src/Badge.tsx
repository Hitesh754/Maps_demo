import React from "react";
import { cn } from "./utils";

export type BadgeVariant =
  | "default"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "cat1"
  | "cat2"
  | "cat3"
  | "cat4"
  | "cat5"
  | "cat6";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-level2)] text-[var(--color-text-primary)] border-[var(--color-border)]",
  outline: "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)]",
  success: "bg-[var(--color-status-ok)]/15 text-[var(--color-status-ok)] border-[var(--color-status-ok)]/30",
  warning: "bg-[var(--color-status-warning)]/15 text-[var(--color-status-warning)] border-[var(--color-status-warning)]/30",
  danger: "bg-[var(--color-status-danger)]/15 text-[var(--color-status-danger)] border-[var(--color-status-danger)]/30",
  cat1: "bg-[var(--color-cat1-pothole)]/15 text-[var(--color-cat1-pothole)] border-[var(--color-cat1-pothole)]/40 font-semibold",
  cat2: "bg-[var(--color-cat2-crack)]/15 text-[var(--color-cat2-crack)] border-[var(--color-cat2-crack)]/40 font-semibold",
  cat3: "bg-[var(--color-cat3-debris)]/15 text-[var(--color-cat3-debris)] border-[var(--color-cat3-debris)]/40 font-semibold",
  cat4: "bg-[var(--color-cat4-flooding)]/15 text-[var(--color-cat4-flooding)] border-[var(--color-cat4-flooding)]/40 font-semibold",
  cat5: "bg-[var(--color-cat5-lighting)]/15 text-[var(--color-cat5-lighting)] border-[var(--color-cat5-lighting)]/40 font-semibold",
  cat6: "bg-[var(--color-cat6-inspection)]/15 text-[var(--color-cat6-inspection)] border-[var(--color-cat6-inspection)]/40 font-semibold"
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium select-none",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
