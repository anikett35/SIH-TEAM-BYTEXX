'use client';

import React from 'react';
import { SimulationParams } from '@/types/disaster';
import {
  X,
  SlidersHorizontal,
  CloudRain,
  Waves,
  AlertOctagon,
  Building,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface ScenarioSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  params: SimulationParams;
  onChangeParams: (newParams: SimulationParams) => void;
  onReset: () => void;
}

export default function ScenarioSimulator({
  isOpen,
  onClose,
  params,
  onChangeParams,
  onReset,
}: ScenarioSimulatorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-modal overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-control bg-slate-100 text-slate-700 border border-slate-200">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Disaster scenario stress testing
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust hydrological and accessibility stress variables
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-control text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Sliders & Controls */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* 1. Rainfall Anomaly Slider */}
          <div className="p-4 rounded-control bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <CloudRain className="w-4 h-4 text-slate-500" />
                Precipitation anomaly
              </span>
              <span className="font-sans font-bold tabular-nums text-gray-900 text-sm">
                {params.rainfallAnomalyPercent >= 0 ? `+${params.rainfallAnomalyPercent}%` : `${params.rainfallAnomalyPercent}%`}
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={100}
              step={5}
              value={params.rainfallAnomalyPercent}
              onChange={(e) =>
                onChangeParams({
                  ...params,
                  rainfallAnomalyPercent: Number(e.target.value),
                })
              }
              className="w-full accent-brand-500 h-1.5 bg-slate-200 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>-20% deficit</span>
              <span>Baseline (0%)</span>
              <span>+100% surge</span>
            </div>
          </div>

          {/* 2. River Crest Rise */}
          <div className="p-4 rounded-control bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <Waves className="w-4 h-4 text-slate-500" />
                River crest elevation rise
              </span>
              <span className="font-sans font-bold tabular-nums text-gray-900 text-sm">
                +{params.riverLevelRiseMeters.toFixed(1)} m
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={params.riverLevelRiseMeters}
              onChange={(e) =>
                onChangeParams({
                  ...params,
                  riverLevelRiseMeters: Number(e.target.value),
                })
              }
              className="w-full accent-brand-500 h-1.5 bg-slate-200 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>0m bank level</span>
              <span>+2.5m warning</span>
              <span>+5.0m breach</span>
            </div>
          </div>

          {/* 3. Shelter Capacity Factor */}
          <div className="p-4 rounded-control bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <Building className="w-4 h-4 text-slate-500" />
                Shelter infrastructure viability
              </span>
              <span className="font-sans font-bold tabular-nums text-gray-900 text-sm">
                {Math.round(params.shelterCapacityFactor * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.2}
              step={0.1}
              value={params.shelterCapacityFactor}
              onChange={(e) =>
                onChangeParams({
                  ...params,
                  shelterCapacityFactor: Number(e.target.value),
                })
              }
              className="w-full accent-brand-500 h-1.5 bg-slate-200 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>50% damaged</span>
              <span>100% standard</span>
              <span>120% auxiliary</span>
            </div>
          </div>

          {/* 4. Toggles: Bridge Collapse & Cloudburst Cell */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                onChangeParams({
                  ...params,
                  simulateBridgeCollapse: !params.simulateBridgeCollapse,
                })
              }
              className={`p-3.5 rounded-control border text-left transition-all ${
                params.simulateBridgeCollapse
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertOctagon className={`w-4 h-4 shrink-0 ${params.simulateBridgeCollapse ? 'text-red-700' : 'text-slate-500'}`} />
                <span className="font-semibold text-xs">Bridge collapse</span>
              </div>
              <p className="text-xs mt-1 text-slate-500">
                Simulate key transit artery cut-off
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                onChangeParams({
                  ...params,
                  cloudburstZoneActive: !params.cloudburstZoneActive,
                })
              }
              className={`p-3.5 rounded-control border text-left transition-all ${
                params.cloudburstZoneActive
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 shrink-0 ${params.cloudburstZoneActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="font-semibold text-xs">Cloudburst cell</span>
              </div>
              <p className={`text-xs mt-1 ${params.cloudburstZoneActive ? 'text-slate-300' : 'text-slate-500'}`}>
                Radar convective cell trigger
              </p>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={onReset}
          >
            Reset baseline
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Apply & return to ops
          </Button>
        </div>
      </div>
    </div>
  );
}
