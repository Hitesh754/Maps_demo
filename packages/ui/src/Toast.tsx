import React from "react";
import { cn } from "./utils";
import { Surface } from "./Surface";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

export interface ToastProps {
  id?: string;
  title: string;
  description?: string;
  variant?: "info" | "success" | "warning" | "danger";
  onDismiss?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = "info",
  onDismiss,
  className
}) => {
  return (
    <Surface
      role="status"
      elevation="level3"
      bordered
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-xl shadow-xl min-w-[280px] max-w-sm animate-in slide-in-from-bottom-5 duration-200",
        variant === "danger" && "border-[var(--color-status-danger)]/50",
        variant === "success" && "border-[var(--color-status-ok)]/50",
        className
      )}
    >
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">{title}</h4>
        {description && (
          <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">{description}</p>
        )}
      </div>
      {onDismiss && (
        <IconButton
          icon={<X className="w-3.5 h-3.5" />}
          aria-label="Dismiss notification"
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-1 -mr-1 -mt-1"
        />
      )}
    </Surface>
  );
};
