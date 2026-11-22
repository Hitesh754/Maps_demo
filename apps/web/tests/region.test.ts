import { describe, it, expect } from "vitest";
import { VADODARA_REGION, isCoordinateInRegion, getRegionBounds } from "../src/lib/region";

describe("Region Configuration & Boundary Checks", () => {
  it("defines Vadodara region coordinates and center", () => {
    expect(VADODARA_REGION.slug).toBe("vadodara");
    expect(VADODARA_REGION.center).toEqual([73.1812, 22.3072]);
    expect(VADODARA_REGION.bbox).toEqual([73.11, 22.24, 73.28, 22.37]);
  });

  it("correctly identifies coordinates inside Vadodara", () => {
    // Sayaji Baug / Vadodara center
    expect(isCoordinateInRegion([73.1812, 22.3072])).toBe(true);
    // Boundary coordinate
    expect(isCoordinateInRegion([73.12, 22.25])).toBe(true);
  });

  it("correctly identifies coordinates outside Vadodara", () => {
    // Ahmedabad (roughly 72.57, 23.02)
    expect(isCoordinateInRegion([72.57, 23.02])).toBe(false);
    // Mumbai (roughly 72.87, 19.07)
    expect(isCoordinateInRegion([72.87, 19.07])).toBe(false);
    // London
    expect(isCoordinateInRegion([-0.12, 51.5])).toBe(false);
  });

  it("computes padded bounds for camera constraints", () => {
    const bounds = getRegionBounds(VADODARA_REGION);
    expect(bounds[0]).toBeCloseTo(73.11 - 0.05);
    expect(bounds[1]).toBeCloseTo(22.24 - 0.05);
    expect(bounds[2]).toBeCloseTo(73.28 + 0.05);
    expect(bounds[3]).toBeCloseTo(22.37 + 0.05);
  });
});
