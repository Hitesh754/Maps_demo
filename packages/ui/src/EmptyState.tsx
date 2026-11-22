import React from "react";
import { cn } from "./utils";
import { Surface } from "./Surface";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  return (
    <Surface
      elevation="level1"
      bordered
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-xl",
        className
      )}
    >
      {icon && (
        <div className="mb-3 text-[var(--color-text-muted)] p-3 rounded-full bg-[var(--color-level2)]">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--color-text-secondary)] max-w-xs mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Surface>
  );
};
