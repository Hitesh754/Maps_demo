import React from "react";
import { cn } from "./utils";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white hover:opacity-90 active:scale-[0.98] shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
  secondary:
    "bg-[var(--color-level2)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] active:scale-[0.98] border border-[var(--color-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
  outline:
    "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-level2)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-level2)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
  danger:
    "bg-[var(--color-status-danger)] text-white hover:opacity-90 active:scale-[0.98] shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--color-status-danger)]"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-9 px-4 text-sm gap-2 rounded-md",
  lg: "h-11 px-6 text-base gap-2.5 rounded-lg"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "secondary",
      size = "md",
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading ? "true" : undefined}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size === "lg" ? "md" : "sm"} />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
