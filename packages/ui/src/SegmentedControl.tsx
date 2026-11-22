import React from "react";
import { cn } from "./utils";

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  className
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-lg bg-[var(--color-level2)] p-1 border border-[var(--color-border)] select-none",
        size === "sm" ? "h-8" : "h-9",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3 rounded-md font-medium transition-all text-xs outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
              size === "sm" ? "py-1 text-xs" : "py-1.5 text-xs",
              isSelected
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm font-semibold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {option.icon && <span className="inline-flex shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
