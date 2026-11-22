import { describe, it, expect, vi } from "vitest";
import { isAllowedUrl, createTransformRequest } from "../src/lib/security/transformRequest";

describe("Network Egress & Request Allowlist Guard", () => {
  it("allows requests to local Meridian tile server (port 8082)", () => {
    expect(isAllowedUrl("http://127.0.0.1:8082/vadodara/14/11833/7140.pbf")).toBe(true);
    expect(isAllowedUrl("http://localhost:8082/vadodara.json")).toBe(true);
  });

  it("allows requests to local Meridian map assets server (port 8083)", () => {
    expect(isAllowedUrl("http://127.0.0.1:8083/glyphs/Noto%20Sans%20Regular/0-255.pbf")).toBe(true);
    expect(isAllowedUrl("http://localhost:8083/sprites/osm-bright.json")).toBe(true);
  });

  it("allows internal relative and blob/data URLs", () => {
    expect(isAllowedUrl("/api/healthz")).toBe(true);
    expect(isAllowedUrl("blob:http://localhost:3000/worker-id")).toBe(true);
    expect(isAllowedUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==")).toBe(true);
  });

  it("blocks third-party tile hosts and external telemetry", () => {
    expect(isAllowedUrl("https://api.mapbox.com/v4/mapbox.mapbox-streets-v8")).toBe(false);
    expect(isAllowedUrl("https://tile.openstreetmap.org/12/100/200.png")).toBe(false);
    expect(isAllowedUrl("https://www.google-analytics.com/collect")).toBe(false);
    expect(isAllowedUrl("https://basemaps.cartocdn.com/rastertiles/voyager/0/0/0.png")).toBe(false);
  });

  it("transformRequest drops blocked requests to blob:null and logs a warning", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const transform = createTransformRequest();

    const blockedResult = transform("https://api.mapbox.com/styles/v1", "Style");
    expect(blockedResult.url).toBe("blob:null");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[Meridian Security] Blocked unapproved request")
    );

    const allowedResult = transform("http://127.0.0.1:8082/vadodara.json", "Source");
    expect(allowedResult.url).toBe("http://127.0.0.1:8082/vadodara.json");

    warnSpy.mockRestore();
  });
});
