import { describe, it, expect } from "vitest";
import { createApiClient } from "../src/client";
import { ProblemDetailsError, TimeoutError, RequestAbortedError } from "../src/errors";

describe("ApiClient", () => {
  it("successfully retrieves health", async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify({ status: "ok", timestamp: "2026-11-22T20:00:00Z" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    const client = createApiClient({ baseUrl: "http://127.0.0.1:8080", fetchFn: mockFetch as unknown as typeof fetch });
    const health = await client.getHealth();
    expect(health.status).toBe("ok");
    expect(health.timestamp).toBe("2026-11-22T20:00:00Z");
  });

  it("successfully retrieves readiness", async () => {
    const mockFetch = async () =>
      new Response(
        JSON.stringify({
          status: "ok",
          timestamp: "2026-11-22T20:00:00Z",
          checks: { postgres: true, nats: true, s3: true }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );

    const client = createApiClient({ baseUrl: "http://127.0.0.1:8080", fetchFn: mockFetch as unknown as typeof fetch });
    const ready = await client.getReady();
    expect(ready.status).toBe("ok");
    expect(ready.checks.postgres).toBe(true);
    expect(ready.checks.nats).toBe(true);
  });

  it("handles 503 problem+json with typed ProblemDetailsError", async () => {
    const problemPayload = {
      type: "https://meridian.internal/errors/dependency-unavailable",
      title: "Service Unavailable",
      status: 503,
      detail: "NATS connection failed",
      code: "DEPENDENCY_UNAVAILABLE",
      instance: "/readyz"
    };

    const mockFetch = async () =>
      new Response(JSON.stringify(problemPayload), {
        status: 503,
        headers: { "Content-Type": "application/problem+json" }
      });

    const client = createApiClient({ baseUrl: "http://127.0.0.1:8080", fetchFn: mockFetch as unknown as typeof fetch });
    await expect(client.getReady()).rejects.toThrow(ProblemDetailsError);

    try {
      await client.getReady();
    } catch (err) {
      expect(err).toBeInstanceOf(ProblemDetailsError);
      const problemErr = err as ProblemDetailsError;
      expect(problemErr.status).toBe(503);
      expect(problemErr.problem.detail).toBe("NATS connection failed");
      expect(problemErr.problem.code).toBe("DEPENDENCY_UNAVAILABLE");
    }
  });

  it("handles timeout correctly", async () => {
    const mockFetch = async (_url: unknown, init?: RequestInit) => {
      return new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const err = new Error("The operation was aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    };

    const client = createApiClient({
      baseUrl: "http://127.0.0.1:8080",
      defaultTimeoutMs: 50,
      fetchFn: mockFetch as unknown as typeof fetch
    });

    await expect(client.getHealth({ timeoutMs: 50 })).rejects.toThrow(TimeoutError);
  });

  it("handles explicit abort signal", async () => {
    const controller = new AbortController();
    const mockFetch = async (_url: unknown, init?: RequestInit) => {
      return new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const err = new Error("Aborted by user");
          err.name = "AbortError";
          reject(err);
        });
      });
    };

    const client = createApiClient({
      baseUrl: "http://127.0.0.1:8080",
      fetchFn: mockFetch as unknown as typeof fetch
    });

    controller.abort();
    await expect(client.getHealth({ signal: controller.signal })).rejects.toThrow(RequestAbortedError);
  });
});
