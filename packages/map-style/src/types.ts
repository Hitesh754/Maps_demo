export type MapTheme = "light" | "dark";

export interface BuildStyleOptions {
  theme?: MapTheme;
  tilesBaseUrl: string; // e.g. "http://127.0.0.1:8082"
  assetsBaseUrl: string; // e.g. "http://127.0.0.1:8083"
  slug?: string; // region slug, default: "vadodara"
  showAdminBoundaries?: boolean; // default false
}

export type LayerGroup =
  | "base"
  | "water"
  | "landuse"
  | "buildings"
  | "roads"
  | "labels"
  | "admin";
