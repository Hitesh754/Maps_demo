import type { ProblemDetails } from "@meridian/contracts";

export class ApiClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiClientError";
  }
}

export class ProblemDetailsError extends ApiClientError {
  readonly status: number;
  readonly problem: ProblemDetails;

  constructor(status: number, problem: ProblemDetails) {
    super(problem.detail ?? problem.title ?? `HTTP ${status}`);
    this.name = "ProblemDetailsError";
    this.status = status;
    this.problem = problem;
  }
}

export class NetworkError extends ApiClientError {
  readonly causeError?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "NetworkError";
    this.causeError = cause;
  }
}

export class TimeoutError extends ApiClientError {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = "TimeoutError";
  }
}

export class RequestAbortedError extends ApiClientError {
  constructor() {
    super("Request was aborted");
    this.name = "RequestAbortedError";
  }
}
