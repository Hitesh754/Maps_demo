export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px"
} as const;

export const radii = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px"
} as const;

export const typography = {
  fontFamily: {
    sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
  },
  fontSize: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px"
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75"
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700"
  }
} as const;

export const zIndex = {
  base: 0,
  map: 10,
  overlay: 100,
  panel: 200,
  modal: 1000,
  toast: 2000
} as const;

export const motion = {
  fast: "150ms cubic-bezier(0.16, 1, 0.3, 1)",
  normal: "250ms cubic-bezier(0.16, 1, 0.3, 1)",
  slow: "400ms cubic-bezier(0.16, 1, 0.3, 1)"
} as const;
