'use client';

import React from 'react';
import { useDisaster } from '@/context/DisasterContext';
import {
  RotateCcw,
  CloudRain,
  Waves,
  Building,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  ArrowRightCircle,
  Play,
  Layers,
  Truck,
  Users,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface ImpactRowProps {
  label: string;
  baseline: number;
  current: number;
  unit?: string;
  worseWhenHigher: boolean;
}

function ImpactRow({ label, baseline, current, unit, worseWhenHigher }: ImpactRowProps) {
  const delta = current - baseline;
  const changed = current !== baseline;
  const isWorse = worseWhenHigher ? current > baseline : current < baseline;

  return (
    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
      <div className="font-semibold text-gray-800">{label}</div>
      <div className="flex items-center gap-3 font-sans tabular-nums">
        <div className="text-gray-400 font-semibold">{baseline.toLocaleString()}</div>
        <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
        <div className={`font-extrabold text-sm ${changed ? (isWorse ? 'text-error' : 'text-success') : 'text-gray-900'}`}>
          {current.toLocaleString()} {unit && <span className="text-xs font-normal text-gray-500">{unit}</span>}
        </div>
        {changed && (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-sans ${
              isWorse
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SimulationLabPage() {
  const {
    currentRegion,
    simulationParams,
    setSimulationParams,
    resetSimulation,
    processedHabitations,
    processedSafeSites,
    isSimulationModified,
  } = useDisaster();

  const baselineImmediateHabs = currentRegion.habitations.filter(
    (h) => h.hazardExposure.floodIndex > 70 || h.hazardExposure.landslideSusceptibility > 80
  );
  const baselineImmediate = baselineImmediateHabs.length;
  const simulatedImmediateHabs = processedHabitations.filter(
    (h) => h.calculatedRisk.priority === 'Immediate'
  );
  const simulatedImmediate = simulatedImmediateHabs.length;

  const baselinePop = baselineImmediateHabs.reduce((acc, h) => acc + h.population, 0);
  const simulatedPop = simulatedImmediateHabs.reduce((acc, h) => acc + h.population, 0);

  const baselineFleet = baselineImmediateHabs.reduce(
    (acc, h) => acc + Math.max(1, Math.ceil(h.population / 42)),
    0
  );
  const currentFleet = simulatedImmediateHabs.reduce(
    (acc, h) => acc + (h.relocationAssignment?.assignedBuses || 0),
    0
  );

  const totalCapacity = processedSafeSites.reduce((acc, s) => acc + s.totalCapacity, 0);
  const totalAssigned = processedSafeSites.reduce(
    (acc, s) => acc + s.currentOccupancy + s.assignedEvacuees,
    0
  );
  const headroom = Math.max(0, totalCapacity - totalAssigned);
  const baselineHeadroom = Math.max(
    0,
    totalCapacity - processedSafeSites.reduce((acc, s) => acc + s.currentOccupancy, 0)
  );

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 font-sans">
      {/* Top Header Row matching ecme-next */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Disaster Simulator</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Multi-hazard stress testing, climatic anomaly injection, and infrastructure failure projection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={resetSimulation}
            disabled={!isSimulationModified}
          >
            Reset Baseline
          </Button>
          <Link href="/">
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRightCircle className="w-3.5 h-3.5" />}
            >
              View GIS Impact
            </Button>
          </Link>
        </div>
      </div>
        {/* Workspace 2-Column Split: Left Controls, Right Impact Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Scenario Controls (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-gray-200">
              <span className="font-bold text-xs uppercase tracking-wider text-gray-900">
                Stress-Test Parameters
              </span>
            </div>

            {/* Climate & Hydrology Panel */}
            <div className="card card-border p-5 bg-white shadow-xs space-y-4">
              <h3 className="font-bold text-xs uppercase text-gray-900 tracking-wider flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-primary" />
                <span>Climate &amp; Hydrological Anomaly</span>
              </h3>

              {/* Rainfall Slider */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Monsoon Precipitation Anomaly</span>
                  <span className="font-sans font-extrabold text-gray-900 text-sm">
                    {simulationParams.rainfallAnomalyPercent >= 0
                      ? `+${simulationParams.rainfallAnomalyPercent}%`
                      : `${simulationParams.rainfallAnomalyPercent}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-20}
                  max={100}
                  step={5}
                  value={simulationParams.rainfallAnomalyPercent}
                  onChange={(e) =>
                    setSimulationParams((p) => ({
                      ...p,
                      rainfallAnomalyPercent: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-primary h-1.5 bg-gray-200 rounded-full cursor-pointer"
                  aria-label="Monsoon precipitation anomaly"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>-20% deficit</span>
                  <span>Baseline (0%)</span>
                  <span>+100% extreme cloudburst</span>
                </div>
              </div>

              {/* River Flood Crest Slider */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">River Flood Crest Rise</span>
                  <span className="font-sans font-extrabold text-gray-900 text-sm">
                    +{simulationParams.riverLevelRiseMeters.toFixed(1)} m
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={simulationParams.riverLevelRiseMeters}
                  onChange={(e) =>
                    setSimulationParams((p) => ({
                      ...p,
                      riverLevelRiseMeters: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-primary h-1.5 bg-gray-200 rounded-full cursor-pointer"
                  aria-label="River flood crest elevation rise"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>0.0m normal bank</span>
                  <span>+2.5m danger mark</span>
                  <span>+5.0m catastrophic breach</span>
                </div>
              </div>

              {/* Cloudburst Cell Toggle */}
              <button
                type="button"
                onClick={() =>
                  setSimulationParams((p) => ({
                    ...p,
                    cloudburstZoneActive: !p.cloudburstZoneActive,
                  }))
                }
                className={`w-full p-3.5 rounded-xl border text-left transition-colors flex items-center justify-between text-xs button-press-feedback ${
                  simulationParams.cloudburstZoneActive
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles
                    className={`w-4 h-4 shrink-0 ${
                      simulationParams.cloudburstZoneActive ? 'text-white' : 'text-gray-400'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-xs uppercase">
                      Cloudburst Convective Cell Activation
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        simulationParams.cloudburstZoneActive ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      Doppler radar detection of &gt;100mm/hr localized deluge
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                    simulationParams.cloudburstZoneActive
                      ? 'bg-white text-gray-900 border-gray-300'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {simulationParams.cloudburstZoneActive ? 'Active' : 'Off'}
                </span>
              </button>
            </div>

            {/* Infrastructure Stress Panel */}
            <div className="card card-border p-5 bg-white shadow-xs space-y-4">
              <h3 className="font-bold text-xs uppercase text-gray-900 tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                <span>Infrastructure &amp; Access Constraints</span>
              </h3>

              {/* Shelter Capacity Factor */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Shelter Network Viability</span>
                  <span className="font-sans font-extrabold text-gray-900 text-sm">
                    {Math.round(simulationParams.shelterCapacityFactor * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.2}
                  step={0.1}
                  value={simulationParams.shelterCapacityFactor}
                  onChange={(e) =>
                    setSimulationParams((p) => ({
                      ...p,
                      shelterCapacityFactor: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-primary h-1.5 bg-gray-200 rounded-full cursor-pointer"
                  aria-label="Shelter infrastructure viability"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>50% structural loss</span>
                  <span>100% nominal</span>
                  <span>120% auxiliary triage</span>
                </div>
              </div>

              {/* Bridge Collapse Toggle */}
              <button
                type="button"
                onClick={() =>
                  setSimulationParams((p) => ({
                    ...p,
                    simulateBridgeCollapse: !p.simulateBridgeCollapse,
                  }))
                }
                className={`w-full p-3.5 rounded-xl border text-left transition-colors flex items-center justify-between text-xs button-press-feedback ${
                  simulationParams.simulateBridgeCollapse
                    ? 'bg-error-subtle/30 border-error/20 text-error'
                    : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertOctagon
                    className={`w-4 h-4 shrink-0 ${
                      simulationParams.simulateBridgeCollapse ? 'text-error' : 'text-gray-400'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-xs uppercase">
                      Critical Arterial Bridge Condition
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        simulationParams.simulateBridgeCollapse ? 'text-error' : 'text-gray-500'
                      }`}
                    >
                      Simulates highway river crossing cutoff, forcing secondary mountain passes
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                    simulationParams.simulateBridgeCollapse
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {simulationParams.simulateBridgeCollapse ? 'Cut Off' : 'Intact'}
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT: Projected Impact Analysis (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="pb-1 border-b border-gray-200">
              <span className="font-bold text-xs uppercase tracking-wider text-gray-900">
                Projected Impact Analysis
              </span>
            </div>

            {/* Before vs After Impact Box */}
            <div className="card card-border p-5 bg-white shadow-xs space-y-4">
              <div className="space-y-2">
                <ImpactRow
                  label="Immediate Red-Zone Settlements (<6h)"
                  baseline={baselineImmediate}
                  current={simulatedImmediate}
                  worseWhenHigher
                />

                <ImpactRow
                  label="Population at Critical Risk"
                  baseline={baselinePop}
                  current={simulatedPop}
                  unit="citizens"
                  worseWhenHigher
                />

                <ImpactRow
                  label="Shelter Absorption Headroom"
                  baseline={baselineHeadroom}
                  current={headroom}
                  unit="slots"
                  worseWhenHigher={false}
                />

                <ImpactRow
                  label="Evacuation Fleet Required"
                  baseline={baselineFleet}
                  current={currentFleet}
                  unit="buses"
                  worseWhenHigher
                />
              </div>

              {/* Operational Advisory */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-relaxed">
                <strong className="text-gray-900">Deterministic Model Active:</strong> Altering climatic anomalies recalculates the multi-hazard composite index for each habitation and dynamically re-allocates convoys to vetted shelters with positive absorption headroom.
              </div>
            </div>

            {/* Impacted Settlements List */}
            <div className="card card-border p-5 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-gray-900 tracking-wider">
                  Critical Settlements Under This Scenario ({simulatedImmediateHabs.length})
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {simulatedImmediateHabs.map((hab) => (
                  <div
                    key={hab.id}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-900 uppercase text-[11px]">{hab.name}</div>
                      <div className="text-gray-500 text-[11px]">
                        {hab.population.toLocaleString()} pop, {hab.relocationAssignment?.safeSiteName || 'Relief Camp'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-sans font-extrabold text-error text-sm">
                        {hab.calculatedRisk.overallScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
