import React from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "./utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
}

export const TooltipProvider = RadixTooltip.Provider;

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 200
}) => {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root delayDuration={delayDuration}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            align={align}
            sideOffset={6}
            className={cn(
              "z-50 overflow-hidden rounded-md bg-[var(--color-text-primary)] px-2.5 py-1 text-xs font-medium text-[var(--color-level0)] shadow-md animate-in fade-in-0 zoom-in-95 select-none"
            )}
          >
            {content}
            <RadixTooltip.Arrow className="fill-[var(--color-text-primary)]" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};
