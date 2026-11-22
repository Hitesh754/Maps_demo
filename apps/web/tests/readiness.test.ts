import { describe, it, expect } from "vitest";
import { createApiClient } from "@meridian/api-client";

describe("Web App API Client integration", () => {
  it("initializes client with custom base URL and probes ready schema", async () => {
    const mockReady = {
      status: "ok",
      timestamp: "2026-11-22T22:00:00Z",
      checks: {
        postgres: true,
        nats: true,
        s3: true
      }
    };

    const mockFetch = async () =>
      new Response(JSON.stringify(mockReady), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    const client = createApiClient({
      baseUrl: "http://127.0.0.1:8080",
      fetchFn: mockFetch as unknown as typeof fetch
    });

    const res = await client.getReady();
    expect(res.status).toBe("ok");
    expect(res.checks.postgres).toBe(true);
    expect(res.checks.nats).toBe(true);
    expect(res.checks.s3).toBe(true);
  });
});
