import React from "react";
import { cn } from "./utils";
import { Surface } from "./Surface";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface BottomSheetProps {
  title?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  className
}) => {
  return (
    <div
      role="region"
      aria-label="Mobile Navigation Sheet"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-in-out md:hidden flex flex-col",
        isOpen ? "translate-y-0" : "translate-y-[calc(100%-3rem)]",
        className
      )}
    >
      <Surface
        elevation="level2"
        bordered
        className="rounded-t-2xl shadow-2xl flex flex-col max-h-[75vh] backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 border-b-0"
      >
        {/* Grab Handle Header */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Collapse sheet" : "Expand sheet"}
          className="w-full flex flex-col items-center pt-2 pb-2 px-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] rounded-t-2xl"
        >
          <div className="w-10 h-1 rounded-full bg-[var(--color-border-muted)] mb-2" />
          <div className="w-full flex items-center justify-between text-xs font-semibold text-[var(--color-text-primary)]">
            <span>{title}</span>
            <div className="text-[var(--color-text-muted)]">
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2">{children}</div>
      </Surface>
    </div>
  );
};
