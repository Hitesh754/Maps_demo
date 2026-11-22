import { describe, it, expect } from "vitest";
import { mapGeolocationError } from "../src/lib/map/geolocation";

describe("Geolocation Error Mapping", () => {
  it("maps PERMISSION_DENIED (code 1)", () => {
    const err = {
      code: 1,
      message: "User denied Geolocation",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    } as GeolocationPositionError;

    const result = mapGeolocationError(err);
    expect(result.status).toBe("denied");
    expect(result.message).toContain("Location access was denied");
  });

  it("maps POSITION_UNAVAILABLE (code 2)", () => {
    const err = {
      code: 2,
      message: "Position unavailable",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    } as GeolocationPositionError;

    const result = mapGeolocationError(err);
    expect(result.status).toBe("unavailable");
  });

  it("maps TIMEOUT (code 3)", () => {
    const err = {
      code: 3,
      message: "Timeout expired",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    } as GeolocationPositionError;

    const result = mapGeolocationError(err);
    expect(result.status).toBe("timeout");
  });
});
