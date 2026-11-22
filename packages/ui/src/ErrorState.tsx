import React from "react";
import { cn } from "./utils";
import { Surface } from "./Surface";
import { Button } from "./Button";
import { AlertCircle, RefreshCw } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Retry",
  isRetrying = false,
  className
}) => {
  return (
    <Surface
      role="alert"
      elevation="level1"
      bordered
      className={cn(
        "flex flex-col items-center justify-center text-center p-6 rounded-xl border-[var(--color-status-danger)]/30",
        className
      )}
    >
      <div className="mb-3 text-[var(--color-status-danger)] p-2.5 rounded-full bg-[var(--color-status-danger)]/10">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          loading={isRetrying}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          {retryLabel}
        </Button>
      )}
    </Surface>
  );
};
