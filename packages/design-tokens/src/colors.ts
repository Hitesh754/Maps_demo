export interface CategoryColors {
  cat1_pothole: string;
  cat2_crack: string;
  cat3_debris: string;
  cat4_flooding: string;
  cat5_lighting: string;
  cat6_inspection: string;
}

export interface ElevationSurfaces {
  level0: string; // Map canvas / background
  level1: string; // Side panel / card
  level2: string; // Floating toolbar / dropdown
  level3: string; // Modal dialog / popover
}

export interface SemanticColors extends ElevationSurfaces, CategoryColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  focusRing: string;
  statusOk: string;
  statusWarning: string;
  statusDanger: string;
  statusInfo: string;
  roadGood: string;
  roadWarning: string;
  roadHazard: string;
}

// CVD-safe categorical scale (Paul Tol / Okabe-Ito inspired for accessibility across deuteranopia, protanopia, tritanopia)
export const categoryColors: CategoryColors = {
  cat1_pothole: "#0077bb",     // Blue
  cat2_crack: "#ee7733",       // Orange
  cat3_debris: "#009988",      // Teal
  cat4_flooding: "#33bbee",    // Cyan
  cat5_lighting: "#ee3377",    // Magenta
  cat6_inspection: "#888888"   // Slate Grey
};

export const lightColors: SemanticColors = {
  // Elevation surfaces
  level0: "#f8fafc",
  level1: "#ffffff",
  level2: "#f1f5f9",
  level3: "#ffffff",

  // Base semantic
  background: "#f8fafc",
  surface: "#ffffff",
  surfaceElevated: "#ffffff",
  border: "#e2e8f0",
  borderMuted: "#cbd5e1",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  accent: "#2563eb",
  focusRing: "#2563eb",
  statusOk: "#16a34a",
  statusWarning: "#d97706",
  statusDanger: "#dc2626",
  statusInfo: "#0284c7",
  roadGood: "#64748b",
  roadWarning: "#f59e0b",
  roadHazard: "#ef4444",

  // Categorical slots
  ...categoryColors
};

export const darkColors: SemanticColors = {
  // Elevation surfaces
  level0: "#0b0f19",
  level1: "#111827",
  level2: "#1f2937",
  level3: "#374151",

  // Base semantic
  background: "#0b0f19",
  surface: "#111827",
  surfaceElevated: "#1f2937",
  border: "#1f2937",
  borderMuted: "#374151",
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  accent: "#3b82f6",
  focusRing: "#60a5fa",
  statusOk: "#22c55e",
  statusWarning: "#f59e0b",
  statusDanger: "#f87171",
  statusInfo: "#38bdf8",
  roadGood: "#475569",
  roadWarning: "#fbbf24",
  roadHazard: "#f87171",

  // Categorical slots
  ...categoryColors
};
