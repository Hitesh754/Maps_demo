"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { lightColors, darkColors } from "@meridian/design-tokens";
import {
  Button,
  IconButton,
  Surface,
  SegmentedControl,
  Switch,
  TooltipProvider,
  InlineNotice,
  Dialog,
  DialogTrigger,
  DialogContent,
  Kbd,
  Badge,
  SearchBox,
  ErrorState
} from "@meridian/ui";
import {
  Sun,
  Moon,
  ArrowLeft,
  Layers,
  MapPin,
  Shield,
  Compass
} from "lucide-react";

export default function DesignSystemPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [switchChecked, setSwitchChecked] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const colors = resolvedTheme === "dark" ? darkColors : lightColors;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[var(--color-level0)] text-[var(--color-text-primary)] p-6 md:p-12 transition-colors">
        <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Map
              </Link>
              <Badge variant="outline" size="sm">
                Design System v0.1.0
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Meridian Design System
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Cartographic Language: <em>"Paper, Ink, and Precision"</em> with strict WCAG AA CVD-safe palettes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SegmentedControl
              ariaLabel="Theme Selector"
              value={theme}
              onChange={(v: string) => setTheme(v as any)}
              options={[
                { value: "light", label: "Light", icon: <Sun className="w-3.5 h-3.5" /> },
                { value: "dark", label: "Dark", icon: <Moon className="w-3.5 h-3.5" /> },
                { value: "system", label: "System", icon: <Compass className="w-3.5 h-3.5" /> }
              ]}
            />
          </div>
        </header>

        <main className="max-w-6xl mx-auto space-y-12">
          {/* Section 1: Elevation Surfaces */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--color-accent)]" />
              1. Elevation Surfaces
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Surface elevation="level0" className="p-4 rounded-xl">
                <span className="text-xs font-bold block mb-1">Level 0: Canvas</span>
                <span className="text-[11px] text-[var(--color-text-secondary)] block">
                  Map background / root surface
                </span>
                <code className="text-[10px] font-mono mt-2 block opacity-75">{colors.level0}</code>
              </Surface>

              <Surface elevation="level1" className="p-4 rounded-xl">
                <span className="text-xs font-bold block mb-1">Level 1: Panels</span>
                <span className="text-[11px] text-[var(--color-text-secondary)] block">
                  Sidebar, sheets, content cards
                </span>
                <code className="text-[10px] font-mono mt-2 block opacity-75">{colors.level1}</code>
              </Surface>

              <Surface elevation="level2" className="p-4 rounded-xl">
                <span className="text-xs font-bold block mb-1">Level 2: Floating</span>
                <span className="text-[11px] text-[var(--color-text-secondary)] block">
                  Floating toolbars, dropdowns
                </span>
                <code className="text-[10px] font-mono mt-2 block opacity-75">{colors.level2}</code>
              </Surface>

              <Surface elevation="level3" className="p-4 rounded-xl">
                <span className="text-xs font-bold block mb-1">Level 3: Overlay</span>
                <span className="text-[11px] text-[var(--color-text-secondary)] block">
                  Modals, popovers, critical alerts
                </span>
                <code className="text-[10px] font-mono mt-2 block opacity-75">{colors.level3}</code>
              </Surface>
            </div>
          </section>

          {/* Section 2: CVD-Safe Categorical Scales */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--color-accent)]" />
              2. Color-Vision-Deficiency Safe Categories
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Paul Tol / Okabe-Ito verified distinct across deuteranopia, protanopia, and tritanopia:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-level1)]">
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{ backgroundColor: colors.cat1_pothole }}
                />
                <span className="text-xs font-bold block">Pothole (Cat 1)</span>
                <code className="text-[10px] font-mono text-[var(--color-text-muted)]">
                  {colors.cat1_pothole}
                </code>
              </div>
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-level1)]">
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{ backgroundColor: colors.cat2_crack }}
                />
                <span className="text-xs font-bold block">Crack (Cat 2)</span>
                <code className="text-[10px] font-mono text-[var(--color-text-muted)]">
                  {colors.cat2_crack}
                </code>
              </div>
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-level1)]">
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{ backgroundColor: colors.cat3_debris }}
                />
                <span className="text-xs font-bold block">Debris (Cat 3)</span>
                <code className="text-[10px] font-mono text-[var(--color-text-muted)]">
                  {colors.cat3_debris}
                </code>
              </div>
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-level1)]">
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{ backgroundColor: colors.cat4_flooding }}
                />
                <span className="text-xs font-bold block">Flood (Cat 4)</span>
                <code className="text-[10px] font-mono text-[var(--color-text-muted)]">
                  {colors.cat4_flooding}
                </code>
              </div>
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-level1)]">
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{ backgroundColor: colors.cat5_lighting }}
                />
                <span className="text-xs font-bold block">Lighting (Cat 5)</span>
                <code className="text-[10px] font-mono text-[var(--color-text-muted)]">
                  {colors.cat5_lighting}
                </code>
              </div>
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-level1)]">
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{ backgroundColor: colors.cat6_inspection }}
                />
                <span className="text-xs font-bold block">Inspection (Cat 6)</span>
                <code className="text-[10px] font-mono text-[var(--color-text-muted)]">
                  {colors.cat6_inspection}
                </code>
              </div>
            </div>
          </section>

          {/* Section 3: Buttons & Controls */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">3. Buttons &amp; Interactive Controls</h2>
            <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-level1)] space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Danger Button</Button>
                <Button variant="primary" loading>
                  Loading
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--color-border)]">
                <IconButton
                  icon={<Compass className="w-4 h-4" />}
                  aria-label="Compass control"
                  tooltip="Reset North"
                />
                <IconButton
                  icon={<MapPin className="w-4 h-4" />}
                  aria-label="Pin coordinate"
                  variant="primary"
                  tooltip="Pin coordinate"
                />
                <IconButton
                  icon={<Layers className="w-4 h-4" />}
                  aria-label="Layers toggle"
                  variant="outline"
                  tooltip="Toggle Layers"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[var(--color-border)]">
                <Switch
                  label="Basemap Building Footprints"
                  description="Enable 2D building contours"
                  checked={switchChecked}
                  onCheckedChange={setSwitchChecked}
                />
              </div>
            </div>
          </section>

          {/* Section 4: SearchBox & Keyboard Shortcuts */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">4. SearchBox &amp; Keyboard Shortcuts</h2>
            <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-level1)] max-w-md space-y-4">
              <SearchBox
                value={searchValue}
                onChange={setSearchValue}
                onClear={() => setSearchValue("")}
              />
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <span>Press</span>
                <Kbd>/</Kbd>
                <span>to focus search input,</span>
                <Kbd>Esc</Kbd>
                <span>to blur</span>
              </div>
            </div>
          </section>

          {/* Section 5: Badges & Status Indicators */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">5. Badges &amp; Status Indicators</h2>
            <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-level1)] flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Online / Ready</Badge>
              <Badge variant="warning">Degraded</Badge>
              <Badge variant="danger">Service Offline</Badge>
              <Badge variant="cat1">Pothole</Badge>
              <Badge variant="cat2">Crack</Badge>
              <Badge variant="cat3">Debris</Badge>
              <Badge variant="cat4">Flood</Badge>
              <Badge variant="cat5">Lighting</Badge>
              <Badge variant="cat6">Audit</Badge>
            </div>
          </section>

          {/* Section 6: Notices, Empty and Error States */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">6. Inline Notices &amp; Feedback States</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <InlineNotice variant="info" title="Sovereign Deployment">
                  All geospatial queries execute locally without cloud egress.
                </InlineNotice>
                <InlineNotice variant="success" title="Basemap Ready">
                  Vadodara PMTiles verified with 14 layers decoded.
                </InlineNotice>
                <InlineNotice variant="warning" title="Out of Extent">
                  Current viewport is outside the configured bounding box.
                </InlineNotice>
                <InlineNotice variant="danger" title="Service Unreachable">
                  Vector tile server port 8082 did not respond to ping.
                </InlineNotice>
              </div>

              <div className="space-y-4">
                <ErrorState
                  title="Tile Server Offline"
                  message="Docker container 'meridian-tile-server' is stopped or unreachable on port 8082."
                  retryLabel="Test Connection"
                  onRetry={() => {}}
                />
              </div>
            </div>
          </section>

          {/* Section 7: Accessible Dialog */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">7. Accessible Dialogs</h2>
            <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-level1)]">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="primary">Open Accessible Modal</Button>
                </DialogTrigger>
                <DialogContent
                  title="Meridian Geographic System"
                  description="High-performance spatial intelligence for municipal road networks."
                >
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
                    This dialog is powered by unstyled Radix UI primitives. It features automated
                    focus trapping, keyboard navigation (Esc to close), and strict WAI-ARIA role semantics.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </section>
        </main>
      </div>
    </TooltipProvider>
  );
}
