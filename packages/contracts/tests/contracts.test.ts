import { describe, it, expect } from "vitest";
import {
  HealthResponseSchema,
  ReadyResponseSchema,
  ProblemDetailsSchema
} from "../src";

describe("Contracts validation", () => {
  it("validates valid health response", () => {
    const valid = {
      status: "ok",
      timestamp: "2026-11-22T20:00:00Z"
    };
    expect(HealthResponseSchema.parse(valid)).toEqual(valid);
  });

  it("rejects invalid health status", () => {
    const invalid = {
      status: "down",
      timestamp: "2026-11-22T20:00:00Z"
    };
    expect(() => HealthResponseSchema.parse(invalid)).toThrow();
  });

  it("validates readiness with checks", () => {
    const ready = {
      status: "ok",
      timestamp: "2026-11-22T20:00:00Z",
      checks: {
        postgres: true,
        nats: true,
        s3: true
      }
    };
    expect(ReadyResponseSchema.parse(ready)).toEqual(ready);
  });

  it("validates degraded readiness", () => {
    const degraded = {
      status: "degraded",
      timestamp: "2026-11-22T20:00:00Z",
      checks: {
        postgres: true,
        nats: false,
        s3: true
      }
    };
    expect(ReadyResponseSchema.parse(degraded)).toEqual(degraded);
  });

  it("validates RFC 9457 problem details", () => {
    const problem = {
      type: "https://meridian.internal/errors/dependency-unavailable",
      title: "Service Unavailable",
      status: 503,
      detail: "Database ping timed out after 2000ms",
      code: "DEPENDENCY_UNAVAILABLE",
      instance: "/readyz"
    };
    expect(ProblemDetailsSchema.parse(problem)).toEqual(problem);
  });
});
