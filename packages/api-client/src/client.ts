import {
  HealthResponse,
  HealthResponseSchema,
  ReadyResponse,
  ReadyResponseSchema,
  ProblemDetails,
  ProblemDetailsSchema
} from "@meridian/contracts";
import {
  ApiClientError,
  ProblemDetailsError,
  NetworkError,
  TimeoutError,
  RequestAbortedError
} from "./errors";

export interface ApiClientConfig {
  baseUrl: string;
  defaultTimeoutMs?: number;
  fetchFn?: typeof fetch;
}

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface MeridianApiClient {
  getHealth(options?: RequestOptions): Promise<HealthResponse>;
  getReady(options?: RequestOptions): Promise<ReadyResponse>;
}

export function createApiClient(config: ApiClientConfig): MeridianApiClient {
  const baseUrl = config.baseUrl.replace(/\/+$/, "");
  const defaultTimeoutMs = config.defaultTimeoutMs ?? 5000;
  const customFetch = config.fetchFn ?? fetch;

  async function request<T>(
    path: string,
    schema: { parse: (val: unknown) => T },
    options?: RequestOptions
  ): Promise<T> {
    const timeoutMs = options?.timeoutMs ?? defaultTimeoutMs;
    const url = `${baseUrl}${path}`;

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    // If caller provided an AbortSignal, forward its abort
    if (options?.signal) {
      if (options.signal.aborted) {
        clearTimeout(timeoutTimer);
        throw new RequestAbortedError();
      }
      options.signal.addEventListener("abort", () => {
        controller.abort();
      });
    }

    try {
      const response = await customFetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json, application/problem+json"
        },
        signal: controller.signal
      });

      clearTimeout(timeoutTimer);

      const contentType = response.headers.get("content-type") ?? "";
      let responseBody: unknown = null;
      if (contentType.includes("json")) {
        try {
          responseBody = await response.json();
        } catch {
          responseBody = null;
        }
      } else {
        const text = await response.text();
        responseBody = text ? { raw: text } : null;
      }

      if (!response.ok) {
        // Parse as RFC 9457 Problem Details if possible
        const parsedProblem = ProblemDetailsSchema.safeParse(responseBody);
        if (parsedProblem.success) {
          throw new ProblemDetailsError(response.status, parsedProblem.data);
        }

        const fallbackProblem: ProblemDetails = {
          type: "about:blank",
          title: response.statusText || `HTTP ${response.status}`,
          status: response.status,
          detail: typeof responseBody === "object" && responseBody !== null && "detail" in responseBody
            ? String((responseBody as Record<string, unknown>).detail)
            : undefined
        };
        throw new ProblemDetailsError(response.status, fallbackProblem);
      }

      return schema.parse(responseBody);
    } catch (err: unknown) {
      clearTimeout(timeoutTimer);

      if (err instanceof ApiClientError) {
        throw err;
      }

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          if (options?.signal?.aborted) {
            throw new RequestAbortedError();
          }
          throw new TimeoutError(timeoutMs);
        }
        throw new NetworkError(err.message, err);
      }

      throw new NetworkError("Unknown network error encountered", err);
    }
  }

  return {
    getHealth(options?: RequestOptions): Promise<HealthResponse> {
      return request("/healthz", HealthResponseSchema, options);
    },
    getReady(options?: RequestOptions): Promise<ReadyResponse> {
      return request("/readyz", ReadyResponseSchema, options);
    }
  };
}
