import React from "react";
import { cn } from "./utils";
import { Surface } from "./Surface";
import { IconButton } from "./IconButton";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface SidePanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  width?: string;
  side?: "left" | "right";
  children: React.ReactNode;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  title,
  isOpen,
  onToggle,
  width = "w-80 sm:w-96",
  side = "left",
  children,
  className
}) => {
  return (
    <aside
      aria-label="Side Panel"
      className={cn(
        "fixed top-4 bottom-4 z-30 transition-transform duration-300 ease-in-out flex flex-col",
        side === "left" ? "left-4" : "right-4",
        width,
        isOpen
          ? "translate-x-0"
          : side === "left"
            ? "-translate-x-[calc(100%+2rem)]"
            : "translate-x-[calc(100%+2rem)]",
        className
      )}
    >
      <Surface
        elevation="level1"
        bordered
        className="flex-1 flex flex-col rounded-xl overflow-hidden backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] select-none">
          <div className="font-semibold text-sm text-[var(--color-text-primary)]">
            {title}
          </div>
          <IconButton
            icon={<X className="w-4 h-4" />}
            aria-label="Close panel"
            variant="ghost"
            size="sm"
            onClick={onToggle}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </Surface>

      {/* Floating collapsed toggle trigger */}
      {!isOpen && (
        <div
          className={cn(
            "absolute top-2 pointer-events-auto",
            side === "left" ? "-right-12" : "-left-12"
          )}
        >
          <IconButton
            icon={
              side === "left" ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )
            }
            aria-label="Open side panel"
            variant="secondary"
            size="md"
            onClick={onToggle}
            className="shadow-md"
          />
        </div>
      )}
    </aside>
  );
};
