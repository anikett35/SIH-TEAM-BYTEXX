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

interface GISControlPanelProps {
  // Hazard layer controls
  activeHazards: Record<HazardType, boolean>;
  onToggleHazard: (type: HazardType) => void;

  // Urgency priority filters
  activePriorityFilters: Record<PriorityLevel, boolean>;
  onTogglePriority: (priority: PriorityLevel) => void;

  // Routes toggle
  showEvacuationRoutes: boolean;
  onToggleEvacuationRoutes: () => void;

  // Additional layer controls
  showShelters?: boolean;
  onToggleShelters?: () => void;
  showRoadConstraints?: boolean;
  onToggleRoadConstraints?: () => void;

  // Summary counts
  habitations: Habitation[];
  onResetFilters?: () => void;
}

export default function GISControlPanel({
  activeHazards,
  onToggleHazard,
  activePriorityFilters,
  onTogglePriority,
  showEvacuationRoutes,
  onToggleEvacuationRoutes,
  showShelters = true,
  onToggleShelters,
  showRoadConstraints = true,
  onToggleRoadConstraints,
  habitations,
  onResetFilters,
}: GISControlPanelProps) {
  const hazardRows: {
    type: HazardType;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'flood',
      label: 'Flood Risk',
      sublabel: 'Inundation zones & river buffer',
      icon: <Waves className="w-3.5 h-3.5 text-primary" />,
    },
    {
      type: 'landslide',
      label: 'Landslide Risk',
      sublabel: 'Slope instability & debris flow',
      icon: <Mountain className="w-3.5 h-3.5 text-warning" />,
    },
    {
      type: 'cloudburst',
      label: 'Cloudburst / Seismic',
      sublabel: 'Severe precipitation cells',
      icon: <CloudRain className="w-3.5 h-3.5 text-primary-mild" />,
    },
    {
      type: 'erosion',
      label: 'Multi-Hazard Zone',
      sublabel: 'High composite vulnerability',
      icon: <Activity className="w-3.5 h-3.5 text-error" />,
    },
  ];

  const priorityRows: {
    level: PriorityLevel;
    label: string;
    windowText: string;
    dotColor: string;
  }[] = [
    {
      level: 'Immediate',
      label: 'Immediate',
      windowText: '< 6 hours window',
      dotColor: 'bg-error',
    },
    {
      level: 'Short-Term',
      label: 'Short-term',
      windowText: '24–48 hours window',
      dotColor: 'bg-warning',
    },
    {
      level: 'Medium-Term',
      label: 'Medium-term',
      windowText: '48+ hours window',
      dotColor: 'bg-gray-400',
    },
    {
      level: 'Low',
      label: 'Low / Resilient',
      windowText: 'Normal watch & stable',
      dotColor: 'bg-success',
    },
  ];

  const immediateCount = habitations.filter(
    (h) => h.calculatedRisk.priority === 'Immediate'
  ).length;

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 text-gray-900 overflow-y-auto font-sans">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block leading-none">
              ByteX DSS &bull; GIS Engine
            </span>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight mt-1 uppercase">
              Spatial Controls
            </h2>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        </div>
      </div>

      <div className="p-3.5 space-y-6 flex-1">
        {/* SECTION 1: HAZARD LAYERS */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Hazard Layers
            </span>
            <span className="text-[11px] text-gray-400 font-medium">Cartographic</span>
          </div>

          <div className="space-y-0.5">
            {hazardRows.map((item) => {
              const isChecked = activeHazards[item.type];
              return (
                <div
                  key={item.type}
                  onClick={() => onToggleHazard(item.type)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer select-none ${
                    isChecked
                      ? 'bg-gray-100/70 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-white shadow-xs' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-tight text-gray-900">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate leading-none mt-0.5">
                        {item.sublabel}
                      </div>
                    </div>
                  </div>

                  {/* Modern Template Switch Toggle */}
                  <div className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                    isChecked ? 'bg-primary' : 'bg-gray-200'
                  }`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                      isChecked ? 'translate-x-3.5' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
              );
            })}

            {/* Road Constraints Row */}
            {onToggleRoadConstraints && (
              <div
                onClick={onToggleRoadConstraints}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer select-none ${
                  showRoadConstraints
                    ? 'bg-gray-100/70 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    showRoadConstraints ? 'bg-white shadow-xs' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <ShieldAlert className="w-3.5 h-3.5 text-error" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold leading-tight text-gray-900">
                      Road Constraints
                    </div>
                    <div className="text-[11px] text-gray-500 truncate leading-none mt-0.5">
                      Submerged & blocked paths
                    </div>
                  </div>
                </div>
                <div className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                  showRoadConstraints ? 'bg-primary' : 'bg-gray-200'
                }`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                    showRoadConstraints ? 'translate-x-3.5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            )}

            {/* Shelters Row */}
            {onToggleShelters && (
              <div
                onClick={onToggleShelters}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer select-none ${
                  showShelters
                    ? 'bg-gray-100/70 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    showShelters ? 'bg-white shadow-xs' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Building2 className="w-3.5 h-3.5 text-success" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold leading-tight text-gray-900">
                      Designated Shelters
                    </div>
                    <div className="text-[11px] text-gray-500 truncate leading-none mt-0.5">
                      Relocation capacity & triage
                    </div>
                  </div>
                </div>
                <div className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                  showShelters ? 'bg-primary' : 'bg-gray-200'
                }`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                    showShelters ? 'translate-x-3.5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            )}

            {/* Evacuation Routes Row */}
            <div
              onClick={onToggleEvacuationRoutes}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer select-none ${
                showEvacuationRoutes
                  ? 'bg-gray-100/70 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  showEvacuationRoutes ? 'bg-white shadow-xs' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Route className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold leading-tight text-gray-900">
                    Evacuation Routes
                  </div>
                  <div className="text-[11px] text-gray-500 truncate leading-none mt-0.5">
                    Safe transit corridors
                  </div>
                </div>
              </div>
              <div className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                showEvacuationRoutes ? 'bg-primary' : 'bg-gray-200'
              }`}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                  showEvacuationRoutes ? 'translate-x-3.5' : 'translate-x-0'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: EVACUATION PRIORITY */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Evacuation Priority
            </span>
            <span className="text-[11px] text-error font-sans font-bold">
              {immediateCount} Critical
            </span>
          </div>

          <div className="space-y-0.5">
            {priorityRows.map((item) => {
              const isSelected = activePriorityFilters[item.level];
              const count = habitations.filter(
                (h) => h.calculatedRisk.priority === item.level
              ).length;

              return (
                <div
                  key={item.level}
                  onClick={() => onTogglePriority(item.level)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-gray-100/70 text-gray-900 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor} shrink-0`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-900 leading-tight">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-gray-400 leading-none mt-0.5">
                        {item.windowText}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: MAP CONTROLS */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="px-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Map Controls
            </span>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Click any settlement marker on the map or row below to inspect its route, fleet allocation, and shelter assignment.
            </p>
          </div>

          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-xs font-bold transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset Layers & Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
