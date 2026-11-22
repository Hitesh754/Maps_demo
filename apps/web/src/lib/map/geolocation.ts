export type GeolocationStatus =
  | "idle"
  | "prompting"
  | "locating"
  | "located"
  | "denied"
  | "unavailable"
  | "timeout"
  | "error";

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export function mapGeolocationError(error: GeolocationPositionError): {
  status: GeolocationStatus;
  message: string;
} {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        status: "denied",
        message: "Location access was denied. Enable location permissions in your browser to view your position."
      };
    case error.POSITION_UNAVAILABLE:
      return {
        status: "unavailable",
        message: "Location information is unavailable. Check your device sensors and connectivity."
      };
    case error.TIMEOUT:
      return {
        status: "timeout",
        message: "Location request timed out. Please try again."
      };
    default:
      return {
        status: "error",
        message: error.message || "An unexpected error occurred while requesting location."
      };
  }
}
