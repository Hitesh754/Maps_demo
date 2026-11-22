"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Map as MapLibreMap } from "maplibre-gl";
import { VADODARA_REGION } from "@/lib/region";
import { layerRegistry, BASEMAP_LAYERS } from "@/lib/layers/registry";
import { formatCameraHash } from "@/lib/map/camera";
import {
  SidePanel,
  BottomSheet,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
  Button,
  Badge,
  FloatingBar,
  Spinner
} from "@meridian/ui";
import {
  MapPin,
  Layers,
  Activity,
  Info,
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  ShieldCheck
} from "lucide-react";

// Client-only dynamic import of MapLibre canvas
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-level0)]">
      <Spinner size="lg" label="Initializing canvas..." />
      <span className="mt-3 text-xs font-medium text-[var(--color-text-secondary)]">
        Loading Meridian Canvas...
      </span>
    </div>
  )
});

interface ServiceStatus {
  name: string;
  url: string;
  status: "ready" | "error" | "checking";
  latencyMs?: number;
  message?: string;
}

export default function MeridianApp() {
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("map");
  const [copiedLink, setCopiedLink] = useState(false);

  // Live camera readout
  const [camera, setCamera] = useState({
    zoom: VADODARA_REGION.defaultZoom,
    lng: VADODARA_REGION.center[0],
    lat: VADODARA_REGION.center[1]
  });

  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const l of BASEMAP_LAYERS) {
      initial[l.id] = l.defaultEnabled;
    }
    return initial;
  });

  // Backend services status
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Meridian API", url: "http://127.0.0.1:8080/readyz", status: "checking" },
    { name: "Vector Tile Server", url: "http://127.0.0.1:8082", status: "checking" },
    { name: "Map Assets & Glyphs", url: "http://127.0.0.1:8083", status: "checking" }
  ]);
  const [isCheckingServices, setIsCheckingServices] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>("");

  const checkServices = useCallback(async () => {
    setIsCheckingServices(true);
    const updated = await Promise.all(
      services.map(async (svc) => {
        const start = performance.now();
        try {
          await fetch(svc.url, { method: "GET", mode: "no-cors" });
          const latency = Math.round(performance.now() - start);
          return {
            ...svc,
            status: "ready" as const,
            latencyMs: latency,
            message: "Online"
          };
        } catch (err: any) {
          const latency = Math.round(performance.now() - start);
          return {
            ...svc,
            status: "error" as const,
            latencyMs: latency,
            message: err?.message || "Unreachable"
          };
        }
      })
    );
    setServices(updated);
    setIsCheckingServices(false);
    setLastCheckedTime(new Date().toLocaleTimeString());
  }, [services]);

  // Initial service check
  useEffect(() => {
    checkServices();
  }, []);

  // Handle layer toggle
  const handleToggleLayer = (layerId: string, enabled: boolean) => {
    setLayerVisibility((prev) => ({ ...prev, [layerId]: enabled }));
    if (map) {
      layerRegistry.applyVisibility(map as any, layerId, enabled);
    }
  };

  // Copy view link with coordinates
  const handleCopyViewLink = async () => {
    if (typeof window === "undefined") return;
    const hash = formatCameraHash({
      zoom: camera.zoom,
      lat: camera.lat,
      lng: camera.lng
    });
    const fullUrl = `${window.location.origin}${window.location.pathname}${hash}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  const handleResetToRegion = () => {
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

  const layersList = layerRegistry.getAll();

  const panelContent = (
    <div className="flex flex-col gap-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="map" className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Map</span>
          </TabsTrigger>
          <TabsTrigger value="layers" className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Layers</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Status</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Map & Viewport Details */}
        <TabsContent value="map" className="flex flex-col gap-3">
          <div className="p-3 rounded-lg bg-[var(--color-level2)] border border-[var(--color-border)] text-xs">
            <div className="font-semibold text-[var(--color-text-primary)] mb-1">
              {VADODARA_REGION.name}
            </div>
            <div className="text-[var(--color-text-secondary)] mb-2">
              Country: {VADODARA_REGION.countryCode} &middot; Data: {VADODARA_REGION.dataSource}
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-t border-[var(--color-border)] font-mono text-[11px]">
              <div>
                <span className="text-[var(--color-text-muted)] block text-[10px]">LAT</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {camera.lat.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block text-[10px]">LNG</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {camera.lng.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block text-[10px]">ZOOM</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {camera.zoom.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyViewLink}
              leftIcon={
                copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-[var(--color-status-ok)]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )
              }
              className="flex-1"
            >
              {copiedLink ? "Link Copied!" : "Share View"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToRegion}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              Fit Region
            </Button>
          </div>
        </TabsContent>

        {/* Tab 2: Layer Registry Toggles */}
        <TabsContent value="layers" className="flex flex-col gap-2.5">
          <div className="text-xs text-[var(--color-text-secondary)] mb-1">
            Toggle basemap features compiled into Vadodara PMTiles:
          </div>
          {layersList.map((layer) => (
            <div
              key={layer.id}
              className="p-2.5 rounded-lg bg-[var(--color-level2)] border border-[var(--color-border)]"
            >
              <Switch
                label={layer.name}
                description={layer.description}
                checked={Boolean(layerVisibility[layer.id])}
                onCheckedChange={(checked: boolean) => handleToggleLayer(layer.id, checked)}
              />
            </div>
          ))}
        </TabsContent>

        {/* Tab 3: System Status & Infrastructure Readiness */}
        <TabsContent value="status" className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-secondary)]">Local Microservices</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkServices}
              loading={isCheckingServices}
              leftIcon={<RefreshCw className="w-3 h-3" />}
            >
              Refresh
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {services.map((svc) => (
              <div
                key={svc.name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-level2)] border border-[var(--color-border)] text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-[var(--color-text-primary)]">{svc.name}</span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                    {svc.url}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {svc.latencyMs !== undefined && (
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                      {svc.latencyMs}ms
                    </span>
                  )}
                  {svc.status === "ready" ? (
                    <Badge variant="success" size="sm">
                      Ready
                    </Badge>
                  ) : svc.status === "checking" ? (
                    <Badge variant="outline" size="sm">
                      Checking
                    </Badge>
                  ) : (
                    <Badge variant="danger" size="sm">
                      Offline
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {lastCheckedTime && (
            <span className="text-[10px] text-[var(--color-text-muted)] text-right">
              Last probe: {lastCheckedTime}
            </span>
          )}
        </TabsContent>

        {/* Tab 4: About, Data Provenance & Licenses */}
        <TabsContent value="about" className="flex flex-col gap-3 text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <div className="p-3 rounded-lg bg-[var(--color-level2)] border border-[var(--color-border)]">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)] mb-1">
              <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Sovereign Geospatial Infrastructure</span>
            </div>
            <p className="text-[11px] mb-2">
              Meridian is a self-hosted geospatial intelligence platform engineered for zero external
              network leakage. All vector tiles, fonts, and API requests execute entirely within your
              configured regional deployment.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 text-[11px]">
            <span className="font-semibold text-[var(--color-text-primary)]">Data & Software Provenance:</span>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>OpenStreetMap:</strong> Basemap data &copy; OpenStreetMap contributors (ODbL).
              </li>
              <li>
                <strong>Planetiler & Protomaps:</strong> Vector PMTiles compiler and high-speed range server (Apache-2.0 / BSD-3-Clause).
              </li>
              <li>
                <strong>Noto Sans Glyphs:</strong> SIL Open Font License 1.1.
              </li>
              <li>
                <strong>MapLibre GL JS:</strong> BSD-3-Clause vector rendering engine.
              </li>
              <li>
                <strong>Radix UI:</strong> MIT accessible headless primitives.
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Floating Region Chip (Top Left) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto">
        <FloatingBar className="px-3 py-1.5 gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[var(--color-status-ok)] animate-pulse" />
            <span className="font-semibold text-xs text-[var(--color-text-primary)]">
              Vadodara, India
            </span>
          </div>
          <span className="text-[var(--color-border-muted)]">|</span>
          <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
            z{camera.zoom.toFixed(1)}
          </span>
        </FloatingBar>
      </div>

      {/* Primary Map Canvas */}
      <MapView
        onMapReady={(instance) => setMap(instance)}
        onCameraChange={(c) => setCamera(c)}
      />

      {/* Desktop Side Panel */}
      <div className="hidden md:block">
        <SidePanel
          title="Meridian Explorer"
          isOpen={panelOpen}
          onToggle={() => setPanelOpen(!panelOpen)}
          side="left"
        >
          {panelContent}
        </SidePanel>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden">
        <BottomSheet
          title="Meridian Explorer"
          isOpen={panelOpen}
          onToggle={() => setPanelOpen(!panelOpen)}
        >
          {panelContent}
        </BottomSheet>
      </div>
    </main>
  );
}
