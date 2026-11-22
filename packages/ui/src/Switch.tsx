import React from "react";
import * as RadixSwitch from "@radix-ui/react-switch";
import { cn } from "./utils";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof RadixSwitch.Root> {
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const generatedId = React.useId();
    const switchId = id || generatedId;

    const switchElement = (
      <RadixSwitch.Root
        ref={ref}
        id={switchId}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--color-accent)] data-[state=unchecked]:bg-[var(--color-border-muted)]",
          className
        )}
        {...props}
      >
        <RadixSwitch.Thumb
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
          )}
        />
      </RadixSwitch.Root>
    );

    if (label) {
      return (
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <label
              htmlFor={switchId}
              className="text-xs font-medium text-[var(--color-text-primary)] cursor-pointer select-none"
            >
              {label}
            </label>
            {description && (
              <span className="text-[11px] text-[var(--color-text-secondary)] select-none">
                {description}
              </span>
            )}
          </div>
          {switchElement}
        </div>
      );
    }

    return switchElement;
  }
);

Switch.displayName = RadixSwitch.Root.displayName;
