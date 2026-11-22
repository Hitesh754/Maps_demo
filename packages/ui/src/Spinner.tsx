import React from "react";
import { cn } from "./utils";
import { VisuallyHidden } from "./VisuallyHidden";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6"
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  label = "Loading",
  className,
  ...props
}) => {
  return (
    <svg
      role="status"
      aria-label={label}
      className={cn("animate-spin text-current", sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
      <VisuallyHidden>{label}</VisuallyHidden>
    </svg>
  );
};
