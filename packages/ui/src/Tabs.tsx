import React from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { cn } from "./utils";

export const Tabs = RadixTabs.Root;

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof RadixTabs.List> {
  className?: string;
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <RadixTabs.List
      ref={ref}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-[var(--color-level2)] p-1 text-[var(--color-text-secondary)] border border-[var(--color-border)] select-none",
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = RadixTabs.List.displayName;

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger> {
  className?: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...props }, ref) => (
    <RadixTabs.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-[var(--color-surface)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[var(--color-surface)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm cursor-pointer",
        className
      )}
      {...props}
    />
  )
);
TabsTrigger.displayName = RadixTabs.Trigger.displayName;

export interface TabsContentProps extends React.ComponentPropsWithoutRef<typeof RadixTabs.Content> {
  className?: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <RadixTabs.Content
      ref={ref}
      className={cn(
        "mt-3 ring-offset-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
        className
      )}
      {...props}
    />
  )
);
TabsContent.displayName = RadixTabs.Content.displayName;
