export type RequestTransform = (
  url: string,
  resourceType?: string
) => { url: string; headers?: Record<string, string>; credentials?: "same-origin" | "include" };

// Allowlist of permissible origins for MapLibre requests
const ALLOWED_ORIGIN_PATTERNS = [
  /^http:\/\/127\.0\.0\.1:(8080|8082|8083)$/,
  /^http:\/\/localhost:(8080|8082|8083)$/
];

/**
 * Checks whether a target URL is allowed under Meridian's Sovereign Network Policy.
 * Blocks all third-party hosts (Mapbox, OpenStreetMap public servers, Google, etc.)
 */
export function isAllowedUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;

  // Blob and data URLs are generated internally by MapLibre (e.g. web workers, image textures)
  if (rawUrl.startsWith("blob:") || rawUrl.startsWith("data:")) {
    return true;
  }

  // Relative URLs target the application origin
  if (rawUrl.startsWith("/") && !rawUrl.startsWith("//")) {
    return true;
  }

  try {
    const parsed = new URL(rawUrl);
    const origin = parsed.origin;

    for (const pattern of ALLOWED_ORIGIN_PATTERNS) {
      if (pattern.test(origin)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * MapLibre transformRequest hook that intercepts and drops unapproved requests.
 */
export function createTransformRequest(): RequestTransform {
  return (url: string, resourceType?: string) => {
    if (!isAllowedUrl(url)) {
      console.warn(
        `[Meridian Security] Blocked unapproved request to "${url}" (type: ${resourceType ?? "unknown"}). Meridian operates in sovereign self-hosted mode.`
      );
      // Cancel request by redirecting to invalid empty blob
      return { url: "blob:null" };
    }

    return { url };
  };
}
