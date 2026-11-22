import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "./utils";
import { IconButton } from "./IconButton";
import { X } from "lucide-react";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogPortal = RadixDialog.Portal;
export const DialogClose = RadixDialog.Close;

export interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  title?: string;
  description?: string;
  className?: string;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ title, description, children, className, ...props }, ref) => (
    <DialogPortal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200" />
      <RadixDialog.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl bg-[var(--color-level3)] p-6 shadow-2xl border border-[var(--color-border)] animate-in fade-in-0 zoom-in-95 duration-200 focus:outline-none",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          {title && (
            <RadixDialog.Title className="text-base font-semibold text-[var(--color-text-primary)]">
              {title}
            </RadixDialog.Title>
          )}
          <RadixDialog.Close asChild>
            <IconButton
              icon={<X className="w-4 h-4" />}
              aria-label="Close dialog"
              variant="ghost"
              size="sm"
            />
          </RadixDialog.Close>
        </div>
        {description && (
          <RadixDialog.Description className="mt-2 text-xs text-[var(--color-text-secondary)]">
            {description}
          </RadixDialog.Description>
        )}
        <div className="mt-4">{children}</div>
      </RadixDialog.Content>
    </DialogPortal>
  )
);
DialogContent.displayName = RadixDialog.Content.displayName;
