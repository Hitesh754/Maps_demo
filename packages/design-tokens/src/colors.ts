export interface SemanticColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  statusOk: string;
  statusWarning: string;
  statusDanger: string;
  statusInfo: string;
  roadGood: string;
  roadWarning: string;
  roadHazard: string;
}

export const lightColors: SemanticColors = {
  background: "#f8fafc",
  surface: "#ffffff",
  surfaceElevated: "#ffffff",
  border: "#e2e8f0",
  borderMuted: "#cbd5e1",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  accent: "#2563eb",
  statusOk: "#16a34a",
  statusWarning: "#d97706",
  statusDanger: "#dc2626",
  statusInfo: "#0284c7",
  roadGood: "#64748b",
  roadWarning: "#f59e0b",
  roadHazard: "#ef4444"
};

export const darkColors: SemanticColors = {
  background: "#0b0f19",
  surface: "#111827",
  surfaceElevated: "#1f2937",
  border: "#1f2937",
  borderMuted: "#374151",
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  accent: "#3b82f6",
  statusOk: "#22c55e",
  statusWarning: "#f59e0b",
  statusDanger: "#f87171",
  statusInfo: "#38bdf8",
  roadGood: "#475569",
  roadWarning: "#fbbf24",
  roadHazard: "#f87171"
};
