import { describe, it, expect } from "vitest";
import { parseCameraHash, formatCameraHash } from "../src/lib/map/camera";

describe("Camera Hash Parser & Formatter", () => {
  it("formats camera coordinates into URL hash", () => {
    const hash = formatCameraHash({
      zoom: 12.345,
      lat: 22.3072,
      lng: 73.1812,
      bearing: 15.5,
      pitch: 30
    });
    expect(hash).toBe("#map=12.35/22.3072/73.1812/15.5/30");
  });

  it("parses valid camera hash string", () => {
    const parsed = parseCameraHash("#map=12.5/22.3072/73.1812/0/0");
    expect(parsed).not.toBeNull();
    expect(parsed?.zoom).toBe(12.5);
    expect(parsed?.lat).toBe(22.3072);
    expect(parsed?.lng).toBe(73.1812);
    expect(parsed?.bearing).toBe(0);
    expect(parsed?.pitch).toBe(0);
  });

  it("returns null for malformed or invalid coordinates", () => {
    expect(parseCameraHash("")).toBeNull();
    expect(parseCameraHash("#something-else")).toBeNull();
    expect(parseCameraHash("#map=invalid/lat/lng")).toBeNull();
    expect(parseCameraHash("#map=12/150/73.1812")).toBeNull(); // lat > 90
    expect(parseCameraHash("#map=12/22/250")).toBeNull(); // lng > 180
  });
});
