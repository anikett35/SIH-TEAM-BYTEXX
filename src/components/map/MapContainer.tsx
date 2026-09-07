'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  DisasterRegion,
  Habitation,
  HazardPolygon,
  HazardType,
  PriorityLevel,
  SafeSite,
} from '@/types/disaster';
import { Loader2 } from 'lucide-react';

// Dynamically import MapLeaflet with SSR disabled
const MapLeaflet = dynamic(() => import('./MapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[440px] flex flex-col items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 rounded-lg">
      <Loader2 className="w-6 h-6 text-blue-700 animate-spin mb-2" />
      <span className="text-xs font-semibold text-slate-800">Initializing GIS Spatial Canvas...</span>
      <span className="text-[11px] text-slate-400 mt-0.5">Loading cartographic and settlement layers</span>
    </div>
  ),
});

interface MapContainerProps {
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

export default function MapContainer(props: MapContainerProps) {
  return <MapLeaflet {...props} />;
}
