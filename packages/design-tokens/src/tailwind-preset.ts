import { spacing, radii, zIndex } from "./scales";

export const meridianTailwindPreset = {
  theme: {
    extend: {
      colors: {
        meridian: {
          level0: "var(--color-level0)",
          level1: "var(--color-level1)",
          level2: "var(--color-level2)",
          level3: "var(--color-level3)",
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          "surface-elevated": "var(--color-surface-elevated)",
          border: "var(--color-border)",
          "border-muted": "var(--color-border-muted)",
          "text-primary": "var(--color-text-primary)",
          "text-secondary": "var(--color-text-secondary)",
          "text-muted": "var(--color-text-muted)",
          accent: "var(--color-accent)",
          "focus-ring": "var(--color-focus-ring)",
          "status-ok": "var(--color-status-ok)",
          "status-warning": "var(--color-status-warning)",
          "status-danger": "var(--color-status-danger)",
          "status-info": "var(--color-status-info)",
          "cat1-pothole": "var(--color-cat1-pothole)",
          "cat2-crack": "var(--color-cat2-crack)",
          "cat3-debris": "var(--color-cat3-debris)",
          "cat4-flooding": "var(--color-cat4-flooding)",
          "cat5-lighting": "var(--color-cat5-lighting)",
          "cat6-inspection": "var(--color-cat6-inspection)"
        }
      },
      boxShadow: {
        "level-0": "var(--shadow-level0)",
        "level-1": "var(--shadow-level1)",
        "level-2": "var(--shadow-level2)",
        "level-3": "var(--shadow-level3)"
      },
      borderRadius: radii,
      spacing,
      zIndex
    }
  }
};

export default meridianTailwindPreset;
