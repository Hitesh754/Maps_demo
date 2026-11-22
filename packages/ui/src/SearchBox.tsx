import React from "react";
import { cn } from "./utils";
import { Search, X } from "lucide-react";
import { Kbd } from "./Kbd";
import { Spinner } from "./Spinner";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  coordinates?: [number, number]; // [lng, lat]
}

export interface SearchBoxProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  onSubmit?: (value: string) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(
  (
    {
      value = "",
      placeholder = "Search places, roads or coordinates...",
      onChange,
      onClear,
      onSubmit,
      loading = false,
      disabled = false,
      className,
      autoFocus = false
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // Keyboard shortcut '/' to focus search input
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === "/" &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSubmit) {
        e.preventDefault();
        onSubmit(value);
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    };

    return (
      <div
        role="search"
        className={cn(
          "relative flex items-center w-full rounded-lg bg-[var(--color-level1)] border border-[var(--color-border)] shadow-xs transition-all focus-within:ring-2 focus-within:ring-[var(--color-focus-ring)] focus-within:border-transparent",
          disabled && "opacity-60 cursor-not-allowed",
          className
        )}
      >
        <div className="flex items-center justify-center pl-3 pr-2 text-[var(--color-text-muted)] pointer-events-none">
          {loading ? <Spinner size="sm" /> : <Search className="w-4 h-4" />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search"
          className="w-full h-9 bg-transparent text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none pr-14"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={() => {
                onClear?.();
                inputRef.current?.focus();
              }}
              aria-label="Clear search input"
              className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Kbd className="hidden sm:inline-flex">/</Kbd>
        </div>
      </div>
    );
  }
);

SearchBox.displayName = "SearchBox";
