import { describe, it, expect } from "vitest";
import { lightColors, darkColors, SemanticColors } from "../src/colors";
import { spacing, radii, zIndex, motion, typography } from "../src/scales";

describe("Design Tokens Coverage", () => {
  const semanticKeys: (keyof SemanticColors)[] = [
    "background",
    "surface",
    "surfaceElevated",
    "border",
    "borderMuted",
    "textPrimary",
    "textSecondary",
    "textMuted",
    "accent",
    "statusOk",
    "statusWarning",
    "statusDanger",
    "statusInfo",
    "roadGood",
    "roadWarning",
    "roadHazard"
  ];

  it("defines every semantic token in both light and dark palettes", () => {
    for (const key of semanticKeys) {
      expect(lightColors[key], `light token missing: ${key}`).toBeDefined();
      expect(lightColors[key]).toMatch(/^#[0-9a-fA-F]{6}$/);

      expect(darkColors[key], `dark token missing: ${key}`).toBeDefined();
      expect(darkColors[key]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("scales and dimensions are defined", () => {
    expect(spacing[4]).toBe("16px");
    expect(radii.md).toBe("8px");
    expect(zIndex.modal).toBe(1000);
    expect(motion.normal).toBeDefined();
    expect(typography.fontFamily.sans).toBeDefined();
  });
});
