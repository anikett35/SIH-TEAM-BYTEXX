'use client';

import React from 'react';
import { Habitation, HazardType, PriorityLevel } from '@/types/disaster';
import {
  Waves,
  Mountain,
  CloudRain,
  Activity,
  Route,
  Building2,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

interface GISTopToolbarProps {
  activeHazards: Record<HazardType, boolean>;
  onToggleHazard: (type: HazardType) => void;
  activePriorityFilters: Record<PriorityLevel, boolean>;
  onTogglePriority: (priority: PriorityLevel) => void;
  showEvacuationRoutes: boolean;
  onToggleEvacuationRoutes: () => void;
  showShelters: boolean;
  onToggleShelters: () => void;
  showRoadConstraints: boolean;
  onToggleRoadConstraints: () => void;
  habitations: Habitation[];
  onResetFilters: () => void;
}

export default function GISTopToolbar({
  activeHazards,
  onToggleHazard,
  activePriorityFilters,
  onTogglePriority,
  showEvacuationRoutes,
  onToggleEvacuationRoutes,
  showShelters,
  onToggleShelters,
  showRoadConstraints,
  onToggleRoadConstraints,
  habitations,
  onResetFilters,
}: GISTopToolbarProps) {
  const hazardToggles: {
    key: HazardType;
    label: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      key: 'flood',
      label: 'Flood',
      icon: <Waves className="w-3.5 h-3.5" />,
      color: 'text-primary',
    },
    {
      key: 'landslide',
      label: 'Landslide',
      icon: <Mountain className="w-3.5 h-3.5" />,
      color: 'text-warning',
    },
    {
      key: 'cloudburst',
      label: 'Cloudburst',
      icon: <CloudRain className="w-3.5 h-3.5" />,
      color: 'text-primary-mild',
    },
    {
      key: 'erosion',
      label: 'Multi-Hazard',
      icon: <Activity className="w-3.5 h-3.5" />,
      color: 'text-error',
    },
  ];

  const priorityLevels: {
    level: PriorityLevel;
    label: string;
    dotColor: string;
  }[] = [
    { level: 'Immediate', label: 'Immediate', dotColor: 'bg-red-500' },
    { level: 'Short-Term', label: 'Short-Term', dotColor: 'bg-amber-500' },
    { level: 'Medium-Term', label: 'Medium-Term', dotColor: 'bg-blue-500' },
    { level: 'Low', label: 'Low', dotColor: 'bg-emerald-500' },
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-sans shrink-0">
      {/* Left: Hazard Layer Toggles & Infrastructural Overlays */}
      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
        {hazardToggles.map((item) => {
          const active = activeHazards[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggleHazard(item.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                active
                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-xs'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className={active ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden md:block" />

        {/* Evacuation Routes */}
        <button
          type="button"
          onClick={onToggleEvacuationRoutes}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            showEvacuationRoutes
              ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-xs'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span>Routes</span>
        </button>

        {/* Safe Shelters */}
        <button
          type="button"
          onClick={onToggleShelters}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            showShelters
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-xs'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Shelters</span>
        </button>

        {/* Road Constraints */}
        <button
          type="button"
          onClick={onToggleRoadConstraints}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            showRoadConstraints
              ? 'bg-red-50 text-red-600 border-red-200 shadow-xs'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Road Blocks</span>
        </button>
      </div>

      {/* Right: Evacuation Priority Urgency Filters & Reset */}
      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
        {priorityLevels.map((p) => {
          const active = activePriorityFilters[p.level];
          const count = habitations.filter(
            (h) => h.calculatedRisk.priority === p.level
          ).length;

          return (
            <button
              key={p.level}
              type="button"
              onClick={() => onTogglePriority(p.level)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                active
                  ? 'bg-white border-gray-300 text-gray-900 shadow-xs'
                  : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60 hover:opacity-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${p.dotColor} shrink-0`} />
              <span>{p.label}</span>
              <span className="font-sans font-bold tabular-nums text-gray-700 bg-gray-100 px-1.5 py-0.2 rounded text-[11px]">
                {count}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onResetFilters}
          title="Reset map layers and filters"
          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors ml-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
