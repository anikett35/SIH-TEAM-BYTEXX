'use client';

import React from 'react';
import { HazardType, PriorityLevel } from '@/types/disaster';
import { Waves, Mountain, CloudRain, Activity, Layers, Route } from 'lucide-react';
import ToggleChip from '@/components/ui/ToggleChip';

interface HazardLayerControlProps {
  activeHazards: Record<HazardType, boolean>;
  onToggleHazard: (type: HazardType) => void;
  activePriorityFilters: Record<PriorityLevel, boolean>;
  onTogglePriority: (priority: PriorityLevel) => void;
  showEvacuationRoutes: boolean;
  onToggleEvacuationRoutes: () => void;
}

export default function HazardLayerControl({
  activeHazards,
  onToggleHazard,
  activePriorityFilters,
  onTogglePriority,
  showEvacuationRoutes,
  onToggleEvacuationRoutes,
}: HazardLayerControlProps) {
  const hazardList: { type: HazardType; label: string; icon: React.ReactNode }[] = [
    { type: 'flood', label: 'Flood inundation', icon: <Waves className="w-3.5 h-3.5" /> },
    { type: 'landslide', label: 'Landslide hazard', icon: <Mountain className="w-3.5 h-3.5" /> },
    { type: 'cloudburst', label: 'Cloudburst cell', icon: <CloudRain className="w-3.5 h-3.5" /> },
    { type: 'erosion', label: 'Slope erosion', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  const priorityList: { level: PriorityLevel; label: string; severity: 'immediate' | 'short-term' | 'medium-term' | 'safe' }[] = [
    { level: 'Immediate', label: 'Immediate (<6h)', severity: 'immediate' },
    { level: 'Short-Term', label: 'Short-term (24-48h)', severity: 'short-term' },
    { level: 'Medium-Term', label: 'Medium-term', severity: 'medium-term' },
    { level: 'Low', label: 'Low / resilient', severity: 'safe' },
  ];

  return (
    <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-card space-y-3.5 shadow-card">
      {/* 1. Hazard Overlays */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-slate-500 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Hazard risk layers</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">GIS overlays</span>
        </div>

        <div className="border border-slate-200 rounded-control divide-y divide-slate-100 overflow-hidden">
          {hazardList.map((item) => (
            <label
              key={item.type}
              className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={activeHazards[item.type]}
                onChange={() => onToggleHazard(item.type)}
                className="w-3.5 h-3.5 rounded-sm border-slate-300 text-brand-800 focus:ring-brand-700 focus:ring-offset-0 shrink-0 cursor-pointer"
              />
              <span className="text-slate-400 shrink-0">{item.icon}</span>
              <span className={activeHazards[item.type] ? 'font-medium text-slate-900' : ''}>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Urgency Filter & Routes Toggle */}
      <div className="pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-heading text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Evacuation urgency
          </span>
          <ToggleChip
            active={showEvacuationRoutes}
            onClick={onToggleEvacuationRoutes}
            icon={<Route className="w-3.5 h-3.5" />}
            label="Routes"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {priorityList.map((item) => (
            <ToggleChip
              key={item.level}
              active={activePriorityFilters[item.level]}
              onClick={() => onTogglePriority(item.level)}
              label={item.label}
              severity={item.severity}
              className="w-full text-xs py-2"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
