import React from "react";
import { cn } from "./utils";
import { Tooltip } from "./Tooltip";
import { Spinner } from "./Spinner";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string; // Strict accessibility requirement
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  tooltip?: string;
}

const variantClasses = {
  primary:
    "bg-[var(--color-accent)] text-white hover:opacity-90 active:scale-[0.96] shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
  secondary:
    "bg-[var(--color-level2)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] active:scale-[0.96] border border-[var(--color-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
  outline:
    "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-level2)] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-level2)] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
  danger:
    "bg-[var(--color-status-danger)] text-white hover:opacity-90 active:scale-[0.96] shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--color-status-danger)]"
};

const sizeClasses = {
  sm: "w-8 h-8 rounded-md p-1.5",
  md: "w-9 h-9 rounded-md p-2",
  lg: "w-11 h-11 rounded-lg p-2.5"
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      "aria-label": ariaLabel,
      variant = "secondary",
      size = "md",
      loading = false,
      disabled = false,
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const button = (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        disabled={disabled || loading}
        aria-busy={loading ? "true" : undefined}
        className={cn(
          "inline-flex items-center justify-center transition-colors outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : icon}
      </button>
    );

    if (tooltip && !disabled) {
      return <Tooltip content={tooltip}>{button}</Tooltip>;
    }

    return button;
  }
);

IconButton.displayName = "IconButton";
