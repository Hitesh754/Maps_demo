import { describe, it, expect } from "vitest";
import { RegionConfigSchema } from "../src/region";

describe("RegionConfigSchema", () => {
  const validRegion = {
    name: "Vadodara, Gujarat, India",
    slug: "vadodara",
    countryCode: "IN",
    bbox: [73.11, 22.24, 73.28, 22.37] as [number, number, number, number],
    center: [73.1812, 22.3072] as [number, number],
    defaultZoom: 12,
    minZoom: 0,
    maxZoom: 15,
    maxBoundsPadding: 0.05,
    showAdminBoundaries: false,
    dataSource: "OpenStreetMap contributors (ODbL)",
  };

  it("validates a compliant region configuration", () => {
    const parsed = RegionConfigSchema.parse(validRegion);
    expect(parsed.slug).toBe("vadodara");
    expect(parsed.countryCode).toBe("IN");
  });

  it("rejects inverted bounding box (west >= east)", () => {
    expect(() =>
      RegionConfigSchema.parse({
        ...validRegion,
        bbox: [73.28, 22.24, 73.11, 22.37],
      })
    ).toThrow("west longitude must be strictly less than east");
  });

  it("rejects inverted bounding box (south >= north)", () => {
    expect(() =>
      RegionConfigSchema.parse({
        ...validRegion,
        bbox: [73.11, 22.37, 73.28, 22.24],
      })
    ).toThrow("south latitude must be strictly less than north");
  });

  it("rejects center point outside bounding box", () => {
    expect(() =>
      RegionConfigSchema.parse({
        ...validRegion,
        center: [74.0, 22.3],
      })
    ).toThrow("Region center [lng, lat] must lie within the region bounding box");
  });

  it("rejects invalid zoom order (minZoom > defaultZoom)", () => {
    expect(() =>
      RegionConfigSchema.parse({
        ...validRegion,
        defaultZoom: 5,
        minZoom: 8,
      })
    ).toThrow("Zoom levels must satisfy: minZoom <= defaultZoom <= maxZoom");
  });

  it("rejects invalid slug containing uppercase or special characters", () => {
    expect(() =>
      RegionConfigSchema.parse({
        ...validRegion,
        slug: "Vadodara_City",
      })
    ).toThrow();
  });
});
