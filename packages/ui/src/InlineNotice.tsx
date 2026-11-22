import React from "react";
import { cn } from "./utils";
import { Info, AlertTriangle, AlertOctagon, CheckCircle2 } from "lucide-react";

export type NoticeVariant = "info" | "warning" | "danger" | "success";

export interface InlineNoticeProps {
  variant?: NoticeVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<NoticeVariant, { container: string; icon: string; IconComponent: React.ComponentType<{ className?: string }> }> = {
  info: {
    container: "bg-[var(--color-status-info)]/10 border-[var(--color-status-info)]/30 text-[var(--color-text-primary)]",
    icon: "text-[var(--color-status-info)]",
    IconComponent: Info
  },
  warning: {
    container: "bg-[var(--color-status-warning)]/10 border-[var(--color-status-warning)]/30 text-[var(--color-text-primary)]",
    icon: "text-[var(--color-status-warning)]",
    IconComponent: AlertTriangle
  },
  danger: {
    container: "bg-[var(--color-status-danger)]/10 border-[var(--color-status-danger)]/30 text-[var(--color-text-primary)]",
    icon: "text-[var(--color-status-danger)]",
    IconComponent: AlertOctagon
  },
  success: {
    container: "bg-[var(--color-status-ok)]/10 border-[var(--color-status-ok)]/30 text-[var(--color-text-primary)]",
    icon: "text-[var(--color-status-ok)]",
    IconComponent: CheckCircle2
  }
};

export const InlineNotice: React.FC<InlineNoticeProps> = ({
  variant = "info",
  title,
  children,
  className
}) => {
  const { container, icon, IconComponent } = variantStyles[variant];

  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn("flex gap-2.5 p-3 rounded-lg border text-xs", container, className)}
    >
      <div className={cn("shrink-0 mt-0.5", icon)}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <div className="text-[var(--color-text-secondary)]">{children}</div>
      </div>
    </div>
  );
};
