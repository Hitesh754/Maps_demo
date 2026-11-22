import { describe, it, expect } from "vitest";
import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import { buildStyle } from "../src/builder";
import { MAP_ATTRIBUTION_HTML, MAP_ATTRIBUTION_TEXT } from "../src/attribution";

describe("buildStyle", () => {
  const baseOptions = {
    tilesBaseUrl: "http://127.0.0.1:8082",
    assetsBaseUrl: "http://127.0.0.1:8083",
    slug: "vadodara",
  };

  it("builds a valid light theme MapLibre style that satisfies official style spec", () => {
    const style = buildStyle({ ...baseOptions, theme: "light" });
    expect(style.version).toBe(8);
    expect(style.name).toBe("Meridian Light");
    expect(style.sources.openmaptiles.url).toBe("http://127.0.0.1:8082/vadodara.json");
    expect(style.glyphs).toBe("http://127.0.0.1:8083/glyphs/{fontstack}/{range}.pbf");

    const errors = validateStyleMin(style as any);
    expect(errors).toHaveLength(0);
  });

  it("builds a valid dark theme MapLibre style that satisfies official style spec", () => {
    const style = buildStyle({ ...baseOptions, theme: "dark" });
    expect(style.version).toBe(8);
    expect(style.name).toBe("Meridian Dark");

    const errors = validateStyleMin(style as any);
    expect(errors).toHaveLength(0);
  });

  it("excludes admin boundaries layer when showAdminBoundaries is false", () => {
    const style = buildStyle({ ...baseOptions, showAdminBoundaries: false });
    const adminLayer = style.layers.find((l: any) => l.id === "admin-boundaries");
    expect(adminLayer).toBeUndefined();
  });

  it("includes admin boundaries layer when showAdminBoundaries is true", () => {
    const style = buildStyle({ ...baseOptions, showAdminBoundaries: true });
    const adminLayer = style.layers.find((l: any) => l.id === "admin-boundaries");
    expect(adminLayer).toBeDefined();
    expect(adminLayer.source).toBe("openmaptiles");
    expect(adminLayer["source-layer"]).toBe("boundary");

    const errors = validateStyleMin(style as any);
    expect(errors).toHaveLength(0);
  });

  it("exports exact attribution text and HTML compliant with OSM and OpenMapTiles", () => {
    expect(MAP_ATTRIBUTION_HTML).toContain("OpenStreetMap");
    expect(MAP_ATTRIBUTION_HTML).toContain("OpenMapTiles");
    expect(MAP_ATTRIBUTION_TEXT).toBe("© OpenStreetMap contributors | © OpenMapTiles");
  });

  it("assigns stable group metadata to all layers for UI toggling", () => {
    const style = buildStyle(baseOptions);
    for (const layer of style.layers) {
      expect(layer.metadata).toBeDefined();
      expect(layer.metadata["meridian:group"]).toBeDefined();
    }
  });
});
