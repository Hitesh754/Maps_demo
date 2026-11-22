export type LayerCategory = "basemap" | "infrastructure" | "environment" | "overlay";

export interface LayerDefinition {
  id: string;
  name: string;
  description: string;
  category: LayerCategory;
  defaultEnabled: boolean;
  mapLayerIds: string[];
}

export interface MapLike {
  setLayoutProperty(layerId: string, name: any, value: any): any;
  getLayer(layerId: string): any;
}

export const BASEMAP_LAYERS: LayerDefinition[] = [
  {
    id: "roads",
    name: "Road Network",
    description: "Highways, arterial roads, primary and local streets",
    category: "infrastructure",
    defaultEnabled: true,
    mapLayerIds: [
      "road-casing",
      "road-minor",
      "road-secondary-tertiary",
      "road-primary",
      "road-motorway",
      "road-label"
    ]
  },
  {
    id: "buildings",
    name: "Buildings",
    description: "2D building footprints with zoom-dependent opacity",
    category: "basemap",
    defaultEnabled: true,
    mapLayerIds: ["building"]
  },
  {
    id: "water",
    name: "Waterways & Lakes",
    description: "Rivers, canals, reservoirs, and natural water bodies",
    category: "environment",
    defaultEnabled: true,
    mapLayerIds: ["water", "waterway"]
  },
  {
    id: "greenery",
    name: "Parks & Green Cover",
    description: "Parks, recreational grounds, and urban woodland",
    category: "environment",
    defaultEnabled: true,
    mapLayerIds: ["landuse-park", "landcover-wood", "landuse-residential"]
  },
  {
    id: "labels",
    name: "Place & Street Names",
    description: "Bilingual place, city, and roadway labels",
    category: "overlay",
    defaultEnabled: true,
    mapLayerIds: ["place-label", "road-label"]
  },
  {
    id: "admin",
    name: "Administrative Limits",
    description: "District and municipal administrative boundaries",
    category: "overlay",
    defaultEnabled: false,
    mapLayerIds: ["admin-boundaries"]
  }
];

export class LayerRegistry {
  private layers: Map<string, LayerDefinition>;

  constructor(initialLayers: LayerDefinition[] = BASEMAP_LAYERS) {
    this.layers = new Map(initialLayers.map((l) => [l.id, l]));
  }

  public getAll(): LayerDefinition[] {
    return Array.from(this.layers.values());
  }

  public get(id: string): LayerDefinition | undefined {
    return this.layers.get(id);
  }

  public register(layer: LayerDefinition): void {
    this.layers.set(layer.id, layer);
  }

  public applyVisibility(
    map: MapLike,
    layerId: string,
    visible: boolean
  ): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    const visibilityValue = visible ? "visible" : "none";
    for (const mapLayerId of layer.mapLayerIds) {
      if (map.getLayer(mapLayerId)) {
        map.setLayoutProperty(mapLayerId, "visibility", visibilityValue);
      }
    }
    return true;
  }
}

export const layerRegistry = new LayerRegistry();
