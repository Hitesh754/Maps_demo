import { describe, it, expect } from "vitest";
import { lightColors, darkColors, categoryColors, SemanticColors } from "../src/colors";
import { spacing, radii, zIndex, motionDuration, shadows, breakpoints, typography } from "../src/scales";

// Helper to compute relative luminance and contrast ratio per WCAG 2.1
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance(rgb: [number, number, number]): number {
  const srgb = rgb.map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const r = srgb[0] ?? 0;
  const g = srgb[1] ?? 0;
  const b = srgb[2] ?? 0;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hexToRgb(hex1));
  const lum2 = relativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Euclidean RGB distance for distinctness check
function rgbDistance(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
}

describe("Design Tokens Coverage & Accessibility", () => {
  const requiredSemanticKeys: (keyof SemanticColors)[] = [
    "level0",
    "level1",
    "level2",
    "level3",
    "background",
    "surface",
    "surfaceElevated",
    "border",
    "borderMuted",
    "textPrimary",
    "textSecondary",
    "textMuted",
    "accent",
    "focusRing",
    "statusOk",
    "statusWarning",
    "statusDanger",
    "statusInfo",
    "roadGood",
    "roadWarning",
    "roadHazard",
    "cat1_pothole",
    "cat2_crack",
    "cat3_debris",
    "cat4_flooding",
    "cat5_lighting",
    "cat6_inspection"
  ];

  it("defines every required semantic token in both light and dark palettes", () => {
    for (const key of requiredSemanticKeys) {
      expect(lightColors[key], `light token missing: ${key}`).toBeDefined();
      expect(lightColors[key]).toMatch(/^#[0-9a-fA-F]{6}$/);

      expect(darkColors[key], `dark token missing: ${key}`).toBeDefined();
      expect(darkColors[key]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("satisfies WCAG AA contrast ratio (>= 4.5:1) for primary text on surfaces", () => {
    // Light mode textPrimary on level0 and level1
    const lightTextLevel0 = contrastRatio(lightColors.textPrimary, lightColors.level0);
    const lightTextLevel1 = contrastRatio(lightColors.textPrimary, lightColors.level1);
    expect(lightTextLevel0).toBeGreaterThanOrEqual(4.5);
    expect(lightTextLevel1).toBeGreaterThanOrEqual(4.5);

    // Dark mode textPrimary on level0 and level1
    const darkTextLevel0 = contrastRatio(darkColors.textPrimary, darkColors.level0);
    const darkTextLevel1 = contrastRatio(darkColors.textPrimary, darkColors.level1);
    expect(darkTextLevel0).toBeGreaterThanOrEqual(4.5);
    expect(darkTextLevel1).toBeGreaterThanOrEqual(4.5);
  });

  it("category colors are pairwise distinct with distance >= 40", () => {
    const keys = Object.keys(categoryColors) as (keyof typeof categoryColors)[];
    for (let i = 0; i < keys.length; i++) {
      const keyI = keys[i];
      if (!keyI) continue;
      for (let j = i + 1; j < keys.length; j++) {
        const keyJ = keys[j];
        if (!keyJ) continue;
        const dist = rgbDistance(categoryColors[keyI], categoryColors[keyJ]);
        expect(dist, `Colors ${keyI} and ${keyJ} are too close (dist: ${dist})`).toBeGreaterThanOrEqual(40);
      }
    }
  });

  it("scales, shadows, breakpoints and dimensions are defined", () => {
    expect(spacing[1]).toBe("4px");
    expect(spacing[4]).toBe("16px");
    expect(radii.md).toBe("8px");
    expect(zIndex.modal).toBe(1000);
    expect(shadows.shadowLevel1).toBeDefined();
    expect(shadows.shadowLevel2).toBeDefined();
    expect(breakpoints.desktop).toBe("1024px");
    expect(motionDuration.normal).toBe("250ms");
    expect(typography.fontFamily.sans).toBeDefined();
  });
});
