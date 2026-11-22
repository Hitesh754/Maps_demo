import type { BuildStyleOptions, MapTheme } from "./types";
import { MAP_ATTRIBUTION_HTML } from "./attribution";

export function buildStyle(options: BuildStyleOptions) {
  const theme: MapTheme = options.theme || "light";
  const slug = options.slug || "vadodara";
  const tilesBaseUrl = options.tilesBaseUrl.replace(/\/+$/, "");
  const assetsBaseUrl = options.assetsBaseUrl.replace(/\/+$/, "");
  const showAdminBoundaries = Boolean(options.showAdminBoundaries);

  const isDark = theme === "dark";

  // Semantic cartographic palette
  const colors = {
    background: isDark ? "#11161d" : "#f5f4f0",
    water: isDark ? "#182433" : "#b8d5e5",
    waterway: isDark ? "#1d2c3e" : "#a2c7dc",
    park: isDark ? "#17281f" : "#d8ebd2",
    landcover: isDark ? "#15241b" : "#cfdfcb",
    buildingFill: isDark ? "#1e293b" : "#e6e9ee",
    buildingStroke: isDark ? "#334155" : "#cbd5e1",
    roadCasing: isDark ? "#0f172a" : "#cbd5e1",
    roadMinor: isDark ? "#283545" : "#ffffff",
    roadSecondary: isDark ? "#3d4b5c" : "#fbe3c7",
    roadPrimary: isDark ? "#c07828" : "#f6ad55",
    roadMotorway: isDark ? "#d96522" : "#e06c28",
    adminBoundary: isDark ? "#64748b" : "#94a3b8",
    textPrimary: isDark ? "#f1f5f9" : "#1e293b",
    textSecondary: isDark ? "#94a3b8" : "#475569",
    textHalo: isDark ? "#0f172a" : "#ffffff",
  };

  const layers: any[] = [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": colors.background,
      },
      metadata: { "meridian:group": "base" },
    },
    {
      id: "landuse-residential",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landuse",
      filter: ["==", "class", "residential"],
      paint: {
        "fill-color": isDark ? "#141b24" : "#f0eee9",
        "fill-opacity": 0.6,
      },
      metadata: { "meridian:group": "landuse" },
    },
    {
      id: "landuse-park",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landuse",
      filter: ["in", "class", "park", "cemetery", "recreation_ground"],
      paint: {
        "fill-color": colors.park,
        "fill-opacity": 0.8,
      },
      metadata: { "meridian:group": "landuse" },
    },
    {
      id: "landcover-wood",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landcover",
      filter: ["==", "class", "wood"],
      paint: {
        "fill-color": colors.landcover,
        "fill-opacity": 0.7,
      },
      metadata: { "meridian:group": "landuse" },
    },
    {
      id: "water",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "water",
      paint: {
        "fill-color": colors.water,
      },
      metadata: { "meridian:group": "water" },
    },
    {
      id: "waterway",
      type: "line",
      source: "openmaptiles",
      "source-layer": "waterway",
      paint: {
        "line-color": colors.waterway,
        "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 14, 3],
      },
      metadata: { "meridian:group": "water" },
    },
    {
      id: "building",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 13,
      paint: {
        "fill-color": colors.buildingFill,
        "fill-outline-color": colors.buildingStroke,
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0.5, 14, 1.0],
      },
      metadata: { "meridian:group": "buildings" },
    },
    // Roads: casings
    {
      id: "road-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      paint: {
        "line-color": colors.roadCasing,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          6,
          0.5,
          10,
          1.5,
          14,
          ["match", ["get", "class"], ["motorway", "trunk"], 7, ["primary", "secondary"], 5, 3],
        ],
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      metadata: { "meridian:group": "roads" },
    },
    // Roads: minor
    {
      id: "road-minor",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", "class", "minor", "service", "track"],
      paint: {
        "line-color": colors.roadMinor,
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.8, 14, 2.5],
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      metadata: { "meridian:group": "roads" },
    },
    // Roads: secondary & tertiary
    {
      id: "road-secondary-tertiary",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", "class", "secondary", "tertiary"],
      paint: {
        "line-color": colors.roadSecondary,
        "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 14, 3.5],
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      metadata: { "meridian:group": "roads" },
    },
    // Roads: primary
    {
      id: "road-primary",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["==", "class", "primary"],
      paint: {
        "line-color": colors.roadPrimary,
        "line-width": ["interpolate", ["linear"], ["zoom"], 7, 1.2, 14, 4.5],
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      metadata: { "meridian:group": "roads" },
    },
    // Roads: motorway & trunk
    {
      id: "road-motorway",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", "class", "motorway", "trunk"],
      paint: {
        "line-color": colors.roadMotorway,
        "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1.5, 14, 6],
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      metadata: { "meridian:group": "roads" },
    },
  ];

  // Conditional Admin Boundaries Layer
  if (showAdminBoundaries) {
    layers.push({
      id: "admin-boundaries",
      type: "line",
      source: "openmaptiles",
      "source-layer": "boundary",
      paint: {
        "line-color": colors.adminBoundary,
        "line-dasharray": [2, 2],
        "line-width": 1.2,
      },
      metadata: { "meridian:group": "admin" },
    });
  }

  // Labels
  layers.push(
    {
      id: "road-label",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "transportation_name",
      minzoom: 12,
      layout: {
        "text-field": ["coalesce", ["get", "name:latin"], ["get", "name"]],
        "text-font": ["Noto Sans Regular"],
        "text-size": 11,
        "symbol-placement": "line",
        "text-max-angle": 30,
      },
      paint: {
        "text-color": colors.textSecondary,
        "text-halo-color": colors.textHalo,
        "text-halo-width": 1.0,
      },
      metadata: { "meridian:group": "labels" },
    },
    {
      id: "place-label",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      layout: {
        "text-field": ["coalesce", ["get", "name:latin"], ["get", "name"]],
        "text-font": ["Noto Sans Bold"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          11,
          10,
          14,
          14,
          18,
        ],
      },
      paint: {
        "text-color": colors.textPrimary,
        "text-halo-color": colors.textHalo,
        "text-halo-width": 1.5,
      },
      metadata: { "meridian:group": "labels" },
    }
  );

  return {
    version: 8 as const,
    name: `Meridian ${isDark ? "Dark" : "Light"}`,
    metadata: {
      "meridian:version": "0.1.0",
      "meridian:theme": theme,
      "meridian:attribution": MAP_ATTRIBUTION_HTML,
    },
    sources: {
      openmaptiles: {
        type: "vector" as const,
        url: `${tilesBaseUrl}/${slug}.json`,
        attribution: MAP_ATTRIBUTION_HTML,
      },
    },
    glyphs: `${assetsBaseUrl}/glyphs/{fontstack}/{range}.pbf`,
    layers,
  };
}
