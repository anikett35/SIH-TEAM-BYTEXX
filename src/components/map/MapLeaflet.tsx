'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  DisasterRegion,
  Habitation,
  HazardPolygon,
  HazardType,
  PriorityLevel,
  SafeSite,
} from '@/types/disaster';
import { Layers, Focus, Navigation } from 'lucide-react';

// Restrained government severity palette
const SEVERITY_COLORS = {
  immediate: {
    accent: '#DC2626', // Red 600
    text: '#991B1B',
    bg: '#FEF2F2',
    border: '#FECACA',
    glow: 'rgba(220, 38, 38, 0.25)',
  },
  'short-term': {
    accent: '#D97706', // Amber 600
    text: '#92400E',
    bg: '#FFFBEB',
    border: '#FDE68A',
    glow: 'rgba(217, 119, 6, 0.25)',
  },
  'medium-term': {
    accent: '#CA8A04', // Yellow 600
    text: '#854D0E',
    bg: '#FEFCE8',
    border: '#FEF08A',
    glow: 'rgba(202, 138, 4, 0.25)',
  },
  safe: {
    accent: '#059669', // Emerald 600
    text: '#065F46',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    glow: 'rgba(5, 150, 105, 0.25)',
  },
} as const;

interface MapLeafletProps {
  region: DisasterRegion;
  habitations: Habitation[];
  safeSites: SafeSite[];
  hazardPolygons: HazardPolygon[];
  selectedHabitation: Habitation | null;
  selectedSafeSite: SafeSite | null;
  onSelectHabitation: (hab: Habitation | null) => void;
  onSelectSafeSite: (site: SafeSite | null) => void;
  activeHazards: Record<HazardType, boolean>;
  activePriorityFilters: Record<PriorityLevel, boolean>;
  showEvacuationRoutes: boolean;
  showShelters?: boolean;
  showRoadConstraints?: boolean;
}

export default function MapLeaflet({
  region,
  habitations,
  safeSites,
  hazardPolygons,
  selectedHabitation,
  selectedSafeSite,
  onSelectHabitation,
  onSelectSafeSite,
  activeHazards,
  activePriorityFilters,
  showEvacuationRoutes,
  showShelters = true,
  showRoadConstraints = true,
}: MapLeafletProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Default to ESRI Light Gray Canvas for clean institutional government GIS clarity (watermark-free)
  const [activeTileType, setActiveTileType] = useState<'light' | 'osm' | 'topo' | 'satellite'>('light');

  // Reliable free tiles without watermarks or required API keys
  const tileSources = {
    light: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    topo: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  // Helper function to auto-fit map bounds safely
  const fitClusterBounds = (map: L.Map) => {
    try {
      const size = map.getSize();
      if (!size || size.x === 0 || size.y === 0) {
        map.setView(region.center, region.zoom);
        return;
      }
      const coords: [number, number][] = [
        ...(habitations || []).map((h) => h.coordinates),
        ...(safeSites || []).map((s) => s.coordinates),
      ];
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
        } else {
          map.setView(region.center, region.zoom);
        }
      } else {
        map.setView(region.center, region.zoom);
      }
    } catch {
      map.setView(region.center, region.zoom);
    }
  };

  // 1. Initialize Map Instance with robust cleanup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Safety: ensure container doesn't retain old leaflet ID
    const container = mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number };
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {
        // ignore
      }
      mapInstanceRef.current = null;
    }

    let resizeObserver: ResizeObserver | null = null;
    let timer1: NodeJS.Timeout | null = null;
    let timer2: NodeJS.Timeout | null = null;

    const map = L.map(container, {
      center: region.center,
      zoom: region.zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.control
      .attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('ByteX DSS &copy; | CARTO | OpenStreetMap')
      .addTo(map);

    const baseTile = L.tileLayer(tileSources[activeTileType], {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);

    tileLayerRef.current = baseTile;
    polygonLayerGroupRef.current = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = L.layerGroup().addTo(map);
    markerLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    const fitAfterLayout = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
        fitClusterBounds(mapInstanceRef.current);
      }
    };

    map.whenReady(() => requestAnimationFrame(fitAfterLayout));
    timer1 = setTimeout(fitAfterLayout, 180);

    timer2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 300);

    resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Change Tile Source
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTile = L.tileLayer(tileSources[activeTileType], {
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
    newTile.bringToBack();
    tileLayerRef.current = newTile;
  }, [activeTileType]);

  // 3. Update Camera View & Bounds when region changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      fitClusterBounds(mapInstanceRef.current);
    }
  }, [region.id]);

  // 4. Fly to selected item
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (selectedHabitation) {
      mapInstanceRef.current.flyTo(selectedHabitation.coordinates, 14, { duration: 1 });
    } else if (selectedSafeSite) {
      mapInstanceRef.current.flyTo(selectedSafeSite.coordinates, 14, { duration: 1 });
    }
  }, [selectedHabitation?.id, selectedSafeSite?.id]);

  // 5. Render Hazard Polygons
  useEffect(() => {
    if (!polygonLayerGroupRef.current) return;
    polygonLayerGroupRef.current.clearLayers();

    (hazardPolygons || []).forEach((poly) => {
      if (!activeHazards[poly.type]) return;

      let fillColor: string = SEVERITY_COLORS['medium-term'].glow;
      let strokeColor: string = SEVERITY_COLORS['medium-term'].accent;

      if (poly.severity === 'critical') {
        fillColor = SEVERITY_COLORS.immediate.glow;
        strokeColor = SEVERITY_COLORS.immediate.accent;
      } else if (poly.severity === 'high') {
        fillColor = SEVERITY_COLORS['short-term'].glow;
        strokeColor = SEVERITY_COLORS['short-term'].accent;
      } else if (poly.severity === 'moderate') {
        fillColor = SEVERITY_COLORS['medium-term'].glow;
        strokeColor = SEVERITY_COLORS['medium-term'].accent;
      } else {
        fillColor = SEVERITY_COLORS.safe.glow;
        strokeColor = SEVERITY_COLORS.safe.accent;
      }

      const polygon = L.polygon(poly.coordinates, {
        color: strokeColor,
        weight: 1.5,
        fillColor: fillColor,
        fillOpacity: 0.65,
        dashArray: poly.severity === 'critical' ? '5, 5' : undefined,
      });

      polygon.bindPopup(`
        <div class="p-3 text-xs text-slate-800 font-sans max-w-xs">
          <div class="font-bold text-sm text-slate-900 tracking-tight">${poly.name}</div>
          <div class="mt-1 flex items-center gap-1.5 font-medium">
            <span class="inline-block w-2.5 h-2.5 rounded-full" style="background:${strokeColor}"></span>
            <span class="capitalize text-slate-600">${poly.type} hazard &bull; <strong class="capitalize text-slate-900 font-bold">${poly.severity} severity</strong></span>
          </div>
          <p class="mt-2 text-slate-600 text-xs leading-relaxed">${poly.description}</p>
          <div class="mt-2.5 text-slate-600 text-xs font-medium bg-slate-50 border border-slate-200 p-2 rounded">
            Intensity index: <span class="text-slate-900 font-bold font-sans">${poly.intensityIndex}/100</span>
          </div>
        </div>
      `);

      polygonLayerGroupRef.current?.addLayer(polygon);
    });
  }, [hazardPolygons, activeHazards]);

  // 6. Render Evacuation Routes
  useEffect(() => {
    if (!routeLayerGroupRef.current) return;
    routeLayerGroupRef.current.clearLayers();

    if (!showEvacuationRoutes) return;

    (habitations || []).forEach((hab) => {
      if (!activePriorityFilters[hab.calculatedRisk.priority]) return;
      if (!hab.relocationAssignment) return;

      const corridor = hab.relocationAssignment.transitRouteCoordinates;
      if (!corridor || corridor.length < 2) return;

      const isImmediate = hab.calculatedRisk.priority === 'Immediate';
      const isSelected = selectedHabitation?.id === hab.id;
      const isBlocked = hab.relocationAssignment.evacuationRouteStatus === 'blocked';

      const polyline = L.polyline(corridor, {
        color: isBlocked ? SEVERITY_COLORS.immediate.accent : isImmediate ? '#2563EB' : '#475569',
        weight: isSelected ? 4 : 2.5,
        opacity: isSelected ? 1.0 : 0.85,
        dashArray: isBlocked ? '4, 6' : '6, 6',
        className: 'evac-route-animated',
      });

      polyline.bindPopup(`
        <div class="p-3 text-xs text-slate-800 font-sans max-w-xs">
          <div class="font-semibold text-slate-500 text-[10px] uppercase tracking-wider">Evacuation Corridor</div>
          <div class="text-slate-900 font-bold text-sm mt-0.5">${hab.name} &rarr; ${hab.relocationAssignment.safeSiteName}</div>
          <div class="mt-2.5 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded border border-slate-200">
            <div class="text-slate-600">Distance: <strong class="text-slate-900 font-sans font-bold">${hab.relocationAssignment.distanceKm} km</strong></div>
            <div class="text-slate-600">Transit time: <strong class="text-slate-900 font-sans font-bold">${hab.relocationAssignment.travelTimeMinutes} min</strong></div>
            <div class="text-slate-600">Fleet req: <strong class="text-slate-900 font-sans font-bold">${hab.relocationAssignment.assignedBuses} buses</strong></div>
            <div class="text-slate-600">Route status: <strong class="capitalize" style="color: ${isBlocked ? SEVERITY_COLORS.immediate.accent : SEVERITY_COLORS.safe.accent}">${hab.relocationAssignment.evacuationRouteStatus}</strong></div>
          </div>
        </div>
      `);

      routeLayerGroupRef.current?.addLayer(polyline);
    });
  }, [habitations, activePriorityFilters, showEvacuationRoutes, selectedHabitation]);

  // 7. Render Habitation Markers & Safe Site Markers
  useEffect(() => {
    if (!markerLayerGroupRef.current) return;
    markerLayerGroupRef.current.clearLayers();

    // A. Render Candidate Safe Sites
    if (showShelters) {
      (safeSites || []).forEach((site) => {
        const isSelected = selectedSafeSite?.id === site.id;
        const utilizationPercent = Math.min(
          100,
          Math.round(((site.currentOccupancy + site.assignedEvacuees) / (site.totalCapacity || 1)) * 100)
        );

        const statusBorder =
          site.status === 'overflow'
            ? SEVERITY_COLORS.immediate.accent
            : site.status === 'near_capacity'
            ? SEVERITY_COLORS['short-term'].accent
            : SEVERITY_COLORS.safe.accent;

        const siteIcon = L.divIcon({
          className: 'custom-safe-site-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          html: `
            <div class="relative cursor-pointer transition-transform duration-200 hover:scale-110 ${
              isSelected ? 'scale-125 ring-2 ring-blue-600 ring-offset-2 rounded-lg' : ''
            }">
              <div class="w-8 h-8 rounded-lg bg-white border-2 flex items-center justify-center shadow-sm"
                   style="border-color: ${statusBorder};">
                <svg class="w-4 h-4" fill="none" stroke="${statusBorder}" stroke-width="2.2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="absolute -bottom-1 -right-1 text-[9px] font-bold font-sans px-1 py-0.2 rounded bg-slate-900 text-white shadow">
                ${utilizationPercent}%
              </div>
            </div>
          `,
        });

        const marker = L.marker(site.coordinates, { icon: siteIcon });
        marker.on('click', () => onSelectSafeSite(site));
        marker.bindPopup(`
          <div class="p-3 text-xs text-slate-800 font-sans max-w-xs">
            <div class="flex items-center gap-1.5 text-xs font-semibold" style="color: ${SEVERITY_COLORS.safe.text}">
              <span>Designated Relocation Shelter</span>
            </div>
            <div class="font-bold text-sm text-slate-900 mt-0.5">${site.name}</div>
            <div class="text-slate-500 text-xs font-medium capitalize">${site.type.replace('_', ' ')} &bull; Elev: ${site.elevationMeters}m</div>
            
            <div class="mt-2.5 p-2 rounded bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-600">Total capacity:</span>
                <span class="font-sans text-slate-900 font-bold">${site.totalCapacity} people</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Allocated evacuees:</span>
                <span class="font-sans font-bold" style="color: ${SEVERITY_COLORS['short-term'].text}">+${site.assignedEvacuees}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Headroom remaining:</span>
                <span class="font-sans font-bold" style="color: ${site.totalCapacity - (site.currentOccupancy + site.assignedEvacuees) < 0 ? SEVERITY_COLORS.immediate.accent : SEVERITY_COLORS.safe.accent}">
                  ${Math.max(0, site.totalCapacity - (site.currentOccupancy + site.assignedEvacuees))} slots
                </span>
              </div>
            </div>
            
            <div class="mt-2.5 text-xs text-slate-500 flex items-center justify-between border-t border-slate-200 pt-2">
              <span>Officer: <strong class="text-slate-700">${site.officerInCharge.name}</strong></span>
              <span class="text-slate-900 font-sans font-bold">${site.officerInCharge.phone}</span>
            </div>
          </div>
        `);

        markerLayerGroupRef.current?.addLayer(marker);
      });
    }

    // B. Render Vulnerable Habitations
    (habitations || []).forEach((hab) => {
      if (!activePriorityFilters[hab.calculatedRisk.priority]) return;

      const isSelected = selectedHabitation?.id === hab.id;
      const isImmediate = hab.calculatedRisk.priority === 'Immediate';
      const isShortTerm = hab.calculatedRisk.priority === 'Short-Term';
      const isMediumTerm = hab.calculatedRisk.priority === 'Medium-Term';

      let markerBg: string = SEVERITY_COLORS.safe.accent;
      let pingHtml = '';

      if (isImmediate) {
        markerBg = SEVERITY_COLORS.immediate.accent;
        pingHtml = `<div class="absolute -inset-1.5 rounded-full animate-ping opacity-30" style="background-color: ${SEVERITY_COLORS.immediate.accent};"></div>`;
      } else if (isShortTerm) {
        markerBg = SEVERITY_COLORS['short-term'].accent;
      } else if (isMediumTerm) {
        markerBg = SEVERITY_COLORS['medium-term'].accent;
      }

      const selectedCallout = isSelected
        ? `<div class="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 text-white font-sans font-bold text-[10px] uppercase whitespace-nowrap shadow-md border border-slate-700 z-[999] pointer-events-none">
            RISK ${hab.calculatedRisk.overallScore} | ${hab.calculatedRisk.priority}
           </div>`
        : '';

      const habIcon = L.divIcon({
        className: 'custom-habitation-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        html: `
          <div class="relative cursor-pointer transition-transform duration-200 hover:scale-125 ${
            isSelected ? 'scale-125 z-50' : ''
          }">
            ${pingHtml}
            <div class="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center font-sans font-bold text-[11px] text-white transition-all ${
              isSelected ? 'ring-2 ring-blue-700 ring-offset-2 scale-110' : ''
            }" style="background-color: ${markerBg};">
              ${hab.calculatedRisk.overallScore}
            </div>
            ${selectedCallout}
          </div>
        `,
      });

      const marker = L.marker(hab.coordinates, { icon: habIcon });
      marker.on('click', () => onSelectHabitation(hab));

      const badgeBg = isImmediate ? '#FEF2F2' : isShortTerm ? '#FFFBEB' : '#ECFDF5';
      const badgeColor = isImmediate ? '#991B1B' : isShortTerm ? '#92400E' : '#065F46';
      const badgeBorder = isImmediate ? '#FECACA' : isShortTerm ? '#FDE68A' : '#A7F3D0';

      marker.bindPopup(`
        <div class="p-3 text-xs text-slate-800 font-sans max-w-xs">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase border" style="background: ${badgeBg}; color: ${badgeColor}; border-color: ${badgeBorder}">
              ${hab.calculatedRisk.priority} Evacuation
            </span>
            <span class="font-sans text-slate-500 text-xs">Score: <strong class="text-slate-900 font-bold">${hab.calculatedRisk.overallScore}/100</strong></span>
          </div>

          <div class="font-bold text-sm text-slate-900 mt-2 tracking-tight">${hab.name}</div>
          ${hab.localName ? `<div class="text-slate-500 text-xs">${hab.localName}, ${hab.district}</div>` : `<div class="text-slate-500 text-xs">${hab.district}</div>`}

          <div class="mt-2 text-slate-700 text-xs leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
            <strong class="text-slate-900">Threat:</strong> ${hab.calculatedRisk.primaryThreatReason}
          </div>

          <div class="mt-2 grid grid-cols-2 gap-1.5 text-xs p-2 rounded bg-slate-50 border border-slate-200">
            <div class="text-slate-600">Pop: <strong class="text-slate-900 font-sans font-bold">${hab.population}</strong></div>
            <div class="text-slate-600">Elevation: <strong class="text-slate-900 font-sans font-bold">${hab.elevationMeters}m</strong></div>
            <div class="text-slate-600">Hazard index: <strong class="text-slate-900 font-sans font-bold">${hab.calculatedRisk.hazardFactor}/100</strong></div>
            <div class="text-slate-600">Route status: <strong class="capitalize ${hab.relocationAssignment?.evacuationRouteStatus === 'blocked' ? 'text-red-700 font-bold' : 'text-emerald-700 font-bold'}">${hab.relocationAssignment?.evacuationRouteStatus || 'Open'}</strong></div>
          </div>

          ${
            hab.relocationAssignment
              ? `
            <div class="mt-2.5 pt-2 border-t border-slate-200 text-xs">
              <div class="text-slate-500 text-[10px] uppercase font-bold">Relocation Shelter:</div>
              <div class="font-bold text-slate-900 mt-0.5">${hab.relocationAssignment.safeSiteName}</div>
              <div class="text-xs text-slate-600 font-sans mt-0.5">
                ${hab.relocationAssignment.distanceKm} km &bull; ${hab.relocationAssignment.travelTimeMinutes} min ETA &bull; <strong class="text-blue-700">${hab.relocationAssignment.assignedBuses} buses</strong>
              </div>
            </div>
          `
              : ''
          }

          <div class="mt-3 pt-2 border-t border-slate-200 grid grid-cols-2 gap-1.5 text-center">
            <a href="/evacuation-plans" class="py-1.5 px-2 bg-blue-700 text-white rounded text-[11px] font-semibold hover:bg-blue-800 transition-colors block">
              Evac Plan
            </a>
            <a href="/shelters" class="py-1.5 px-2 bg-slate-100 text-slate-800 border border-slate-300 rounded text-[11px] font-semibold hover:bg-slate-200 transition-colors block">
              View Shelter
            </a>
          </div>
        </div>
      `);

      markerLayerGroupRef.current?.addLayer(marker);
    });
  }, [
    habitations,
    safeSites,
    activePriorityFilters,
    showShelters,
    selectedHabitation?.id,
    selectedSafeSite?.id,
  ]);

  return (
    <div className="gis-map relative flex-1 w-full h-full min-h-[440px] overflow-hidden bg-slate-100">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Floating Basemap Selector */}
      <div className="map-control absolute top-3 left-3 z-[400] flex items-center gap-1 p-1 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm text-xs font-medium text-slate-700">
        <span className="text-slate-500 px-2 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-blue-700" />
          <span>Layer:</span>
        </span>
        <button
          onClick={() => setActiveTileType('light')}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            activeTileType === 'light'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Light GIS
        </button>
        <button
          onClick={() => setActiveTileType('osm')}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            activeTileType === 'osm'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          OpenStreet
        </button>
        <button
          onClick={() => setActiveTileType('topo')}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            activeTileType === 'topo'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Topographic
        </button>
        <button
          onClick={() => setActiveTileType('satellite')}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            activeTileType === 'satellite'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Quick Recenter / Focus Settlements Button */}
      <button
        onClick={() => {
          if (mapInstanceRef.current) {
            fitClusterBounds(mapInstanceRef.current);
            onSelectHabitation(null);
            onSelectSafeSite(null);
          }
        }}
        title="Reset and focus settlement cluster"
        className="map-control absolute bottom-3 left-3 sm:bottom-6 sm:left-3 z-[400] px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-sm transition-all flex items-center gap-1.5 text-xs font-semibold"
      >
        <Focus className="w-3.5 h-3.5 text-blue-700" />
        <span>Focus Cluster</span>
      </button>

      {/* Map Legend Overlay */}
      <div className="map-legend absolute bottom-3 right-12 z-[400] hidden md:block p-3 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md text-xs max-w-[210px]">
        <div className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between border-b border-slate-200 pb-1.5">
          <span>Map Legend</span>
          <span className="text-[9px] text-emerald-700 font-bold px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200">LIVE</span>
        </div>
        <div className="space-y-1.5 text-slate-700 text-[11px] font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
            <span className="text-slate-900 font-semibold">Immediate Hazard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-700">Short-Term Watch</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" />
            <span className="text-slate-700">Medium-Term</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600 shrink-0" />
            <span className="text-emerald-800 font-semibold">Safe Shelter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 border-b-2 border-dashed border-blue-600 shrink-0" />
            <span className="text-slate-700">Evacuation Corridor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
