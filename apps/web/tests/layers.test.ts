import { describe, it, expect, vi } from "vitest";
import { LayerRegistry } from "../src/lib/layers/registry";

describe("Layer Registry", () => {
  it("initializes with default basemap layers", () => {
    const registry = new LayerRegistry();
    const all = registry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(6);
    expect(registry.get("roads")).toBeDefined();
    expect(registry.get("water")).toBeDefined();
    expect(registry.get("greenery")).toBeDefined();
  });

  it("applies visibility to map layers correctly", () => {
    const registry = new LayerRegistry();
    const existingLayers = new Set(["road-casing", "road-minor", "road-primary"]);

    const mockMap = {
      setLayoutProperty: vi.fn(),
      getLayer: (id: string) => (existingLayers.has(id) ? {} : undefined)
    };

    const handled = registry.applyVisibility(mockMap, "roads", false);
    expect(handled).toBe(true);

    expect(mockMap.setLayoutProperty).toHaveBeenCalledWith("road-casing", "visibility", "none");
    expect(mockMap.setLayoutProperty).toHaveBeenCalledWith("road-minor", "visibility", "none");
    expect(mockMap.setLayoutProperty).toHaveBeenCalledWith("road-primary", "visibility", "none");
  });

  it("returns false when applying visibility for unknown layer", () => {
    const registry = new LayerRegistry();
    const mockMap = { setLayoutProperty: vi.fn(), getLayer: vi.fn() };
    const handled = registry.applyVisibility(mockMap, "nonexistent-layer", true);
    expect(handled).toBe(false);
  });
});
