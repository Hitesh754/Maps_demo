"use client";

import React, { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, ScaleControl, AttributionControl, Marker, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}
import { buildStyle } from "@meridian/map-style";
import { VADODARA_REGION, isCoordinateInRegion } from "@/lib/region";
import { parseCameraHash, formatCameraHash } from "@/lib/map/camera";
import { createTransformRequest } from "@/lib/security/transformRequest";
import { mapGeolocationError, GeolocationStatus } from "@/lib/map/geolocation";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { FloatingBar, IconButton, Spinner, InlineNotice, Button } from "@meridian/ui";
import {
  Plus,
  Minus,
  Compass,
  Locate,
  LocateFixed,
  Maximize,
  Minimize,
  Sun,
  Moon,
  RotateCcw,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

export interface MapViewProps {
  onMapReady?: (map: MapLibreMap) => void;
  onCameraChange?: (camera: { zoom: number; lng: number; lat: number }) => void;
  className?: string;
}

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export const MapView: React.FC<MapViewProps> = ({ onMapReady, onCameraChange, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const locationMarkerRef = useRef<Marker | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { resolvedTheme, setTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);
  const [tileServerError, setTileServerError] = useState<string | null>(null);
  const [isOutOfRegion, setIsOutOfRegion] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeolocationStatus>("idle");
  const [geoError, setGeoError] = useState<string | null>(null);

  const tilesBaseUrl = process.env.NEXT_PUBLIC_TILES_BASE_URL || "http://127.0.0.1:8082";
  const assetsBaseUrl = process.env.NEXT_PUBLIC_MAP_ASSETS_BASE_URL || "http://127.0.0.1:8083";

  // Check WebGL on mount
  useEffect(() => {
    if (!checkWebGLSupport()) {
      setWebglSupported(false);
      setIsLoading(false);
    }
  }, []);

  // Initialize MapLibre
  useEffect(() => {
    if (!containerRef.current || !webglSupported || mapRef.current) return;

    // Determine initial camera from URL hash or region config
    const initialHash = typeof window !== "undefined" ? window.location.hash : "";
    const parsedCamera = parseCameraHash(initialHash);

    const initialCenter = parsedCamera
      ? [parsedCamera.lng, parsedCamera.lat] as [number, number]
      : VADODARA_REGION.center;
    const initialZoom = parsedCamera ? parsedCamera.zoom : VADODARA_REGION.defaultZoom;
    const initialBearing = parsedCamera?.bearing || 0;
    const initialPitch = parsedCamera?.pitch || 0;

    const style = buildStyle({
      theme: resolvedTheme,
      slug: VADODARA_REGION.slug,
      tilesBaseUrl,
      assetsBaseUrl,
      showAdminBoundaries: false
    });

    const map = new MapLibreMap({
      container: containerRef.current,
      style: style as any,
      center: initialCenter,
      zoom: initialZoom,
      minZoom: VADODARA_REGION.minZoom,
      maxZoom: VADODARA_REGION.maxZoom,
      bearing: initialBearing,
      pitch: initialPitch,
      attributionControl: false,
      transformRequest: createTransformRequest() as any
    });

    // Add scale bar (bottom-left)
    const scaleControl = new ScaleControl({ maxWidth: 120, unit: "metric" });
    map.addControl(scaleControl, "bottom-left");

    // Add sovereign attribution (bottom-right)
    const attributionControl = new AttributionControl({
      compact: false,
      customAttribution: "© OpenMapTiles © OpenStreetMap contributors"
    });
    map.addControl(attributionControl, "bottom-right");

    map.on("load", () => {
      setIsLoading(false);
      onMapReady?.(map);
    });

    map.on("error", (e) => {
      // Catch tile server failures
      const errorMsg = e.error?.message || "";
      if (
        errorMsg.includes("8082") ||
        errorMsg.includes("Failed to fetch") ||
        errorMsg.includes("404") ||
        errorMsg.includes("503")
      ) {
        setTileServerError(
          "Local tile server (port 8082) is unreachable. Check Docker container 'meridian-tile-server'."
        );
      }
    });

    // Camera move listener: debounced URL hash sync and out-of-region check
    const handleMove = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bearing = map.getBearing();
      const pitch = map.getPitch();

      // Check if viewing outside region
      const inside = isCoordinateInRegion([center.lng, center.lat], VADODARA_REGION, 0.05);
      setIsOutOfRegion(!inside);

      onCameraChange?.({ zoom, lng: center.lng, lat: center.lat });

      // Debounced hash sync
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const hash = formatCameraHash({
          zoom,
          lat: center.lat,
          lng: center.lng,
          bearing,
          pitch
        });
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", hash);
        }
      }, 300);
    };

    map.on("move", handleMove);

    mapRef.current = map;

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (locationMarkerRef.current) locationMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [webglSupported]);

  // Update map style when theme changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const newStyle = buildStyle({
      theme: resolvedTheme,
      slug: VADODARA_REGION.slug,
      tilesBaseUrl,
      assetsBaseUrl,
      showAdminBoundaries: false
    });

    map.setStyle(newStyle as any, { diff: true });
  }, [resolvedTheme, tilesBaseUrl, assetsBaseUrl]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Controls Handlers
  const handleZoomIn = () => mapRef.current?.zoomIn({ duration: 250 });
  const handleZoomOut = () => mapRef.current?.zoomOut({ duration: 250 });
  const handleResetNorth = () => mapRef.current?.resetNorthPitch({ duration: 300 });

  const handleFitRegion = () => {
    const map = mapRef.current;
    if (!map) return;
    const [minLng, minLat, maxLng, maxLat] = VADODARA_REGION.bbox;
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat]
      ],
      { padding: 40, duration: 600 }
    );
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoStatus("unavailable");
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoStatus("locating");
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setGeoStatus("located");

        const map = mapRef.current;
        if (map) {
          map.flyTo({ center: [longitude, latitude], zoom: 15, duration: 800 });

          // Update or create location marker
          if (!locationMarkerRef.current) {
            const el = document.createElement("div");
            el.className =
              "w-4 h-4 rounded-full bg-[var(--color-accent)] border-2 border-white shadow-lg ring-4 ring-blue-500/30 animate-pulse";
            locationMarkerRef.current = new Marker({ element: el })
              .setLngLat([longitude, latitude])
              .addTo(map);
          } else {
            locationMarkerRef.current.setLngLat([longitude, latitude]);
          }
        }
      },
      (err) => {
        const mapped = mapGeolocationError(err);
        setGeoStatus(mapped.status);
        setGeoError(mapped.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleToggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const handleRetryTileServer = () => {
    setTileServerError(null);
    const map = mapRef.current;
    if (map) {
      const newStyle = buildStyle({
        theme: resolvedTheme,
        slug: VADODARA_REGION.slug,
        tilesBaseUrl,
        assetsBaseUrl,
        showAdminBoundaries: false
      });
      map.setStyle(newStyle as any);
    }
  };

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--color-level0)] text-[var(--color-text-primary)]">
        <AlertTriangle className="w-12 h-12 text-[var(--color-status-warning)] mb-4" />
        <h2 className="text-lg font-bold mb-2">WebGL Acceleration Required</h2>
        <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-md">
          Meridian's vector basemap engine requires WebGL hardware acceleration. Please enable WebGL in
          your browser graphics settings or update your GPU drivers.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className || ""}`}>
      {/* MapLibre DOM Container */}
      <div ref={containerRef} className="w-full h-full outline-none" tabIndex={0} aria-label="Interactive Map of Vadodara" />

      {/* Loading Skeleton Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--color-level0)] bg-opacity-70 backdrop-blur-xs transition-opacity duration-300">
          <Spinner size="lg" label="Loading vector basemap..." />
          <span className="mt-3 text-xs font-medium text-[var(--color-text-secondary)]">
            Loading Vadodara Basemap...
          </span>
        </div>
      )}

      {/* Floating Control Cluster (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <FloatingBar className="flex-col">
          <IconButton
            icon={<Plus className="w-4 h-4" />}
            aria-label="Zoom in"
            variant="ghost"
            size="md"
            tooltip="Zoom In"
            onClick={handleZoomIn}
          />
          <IconButton
            icon={<Minus className="w-4 h-4" />}
            aria-label="Zoom out"
            variant="ghost"
            size="md"
            tooltip="Zoom Out"
            onClick={handleZoomOut}
          />
          <IconButton
            icon={<Compass className="w-4 h-4" />}
            aria-label="Reset orientation north"
            variant="ghost"
            size="md"
            tooltip="Reset North"
            onClick={handleResetNorth}
          />
          <IconButton
            icon={<RotateCcw className="w-4 h-4" />}
            aria-label="Fit region extent"
            variant="ghost"
            size="md"
            tooltip="Fit Vadodara Region"
            onClick={handleFitRegion}
          />
        </FloatingBar>

        <FloatingBar className="flex-col">
          <IconButton
            icon={
              geoStatus === "locating" ? (
                <Spinner size="sm" />
              ) : geoStatus === "located" ? (
                <LocateFixed className="w-4 h-4 text-[var(--color-accent)]" />
              ) : (
                <Locate className="w-4 h-4" />
              )
            }
            aria-label="Locate me"
            variant="ghost"
            size="md"
            tooltip={
              geoStatus === "locating"
                ? "Locating..."
                : geoStatus === "located"
                  ? "Located"
                  : "Find My Location"
            }
            disabled={geoStatus === "locating"}
            onClick={handleGeolocate}
          />
          <IconButton
            icon={resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            variant="ghost"
            size="md"
            tooltip={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            onClick={handleToggleTheme}
          />
          <IconButton
            icon={isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            variant="ghost"
            size="md"
            tooltip={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            onClick={handleToggleFullscreen}
          />
        </FloatingBar>
      </div>

      {/* Geolocation Error Feedback Toast */}
      {geoError && (
        <div className="absolute bottom-16 left-4 right-4 sm:left-auto sm:right-4 z-30 max-w-sm animate-in fade-in-0 duration-200">
          <InlineNotice variant="warning" title="Geolocation Notice">
            <div className="flex items-center justify-between gap-2">
              <span>{geoError}</span>
              <Button variant="ghost" size="sm" onClick={() => setGeoError(null)}>
                Dismiss
              </Button>
            </div>
          </InlineNotice>
        </div>
      )}

      {/* Out of Region Notice Banner */}
      {isOutOfRegion && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-md animate-in slide-in-from-top-4 duration-300">
          <FloatingBar className="px-3 py-1.5 gap-3 bg-[var(--color-level1)] shadow-lg">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <AlertTriangle className="w-4 h-4 text-[var(--color-status-warning)] shrink-0" />
              <span>Viewing area outside configured region (Vadodara)</span>
            </div>
            <Button variant="primary" size="sm" onClick={handleFitRegion}>
              Return
            </Button>
          </FloatingBar>
        </div>
      )}

      {/* Tile Server Outage Notice */}
      {tileServerError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 max-w-lg w-full px-4 animate-in slide-in-from-top-4 duration-300">
          <InlineNotice variant="danger" title="Tile Server Connection Error">
            <div className="flex flex-col gap-2">
              <span>{tileServerError}</span>
              <div className="flex gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryTileServer}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Retry Connection
                </Button>
              </div>
            </div>
          </InlineNotice>
        </div>
      )}
    </div>
  );
};

export default MapView;
