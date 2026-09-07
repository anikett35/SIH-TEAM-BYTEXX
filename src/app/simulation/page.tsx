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
    <div className="p-3.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/60 border border-gray-200 flex items-center justify-between gap-3 text-xs font-sans transition-colors">
      <div className="font-semibold text-gray-800">{label}</div>
      <div className="flex items-center gap-2.5 font-sans tabular-nums shrink-0">
        <span className="text-gray-400 font-medium text-xs">
          {baseline.toLocaleString()}
        </span>
        <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
        <span className="font-bold text-sm text-gray-900">
          {current.toLocaleString()}{' '}
          {unit && <span className="text-[11px] font-normal text-gray-400">{unit}</span>}
        </span>
        {changed ? (
          <span
            className={`inline-flex items-center justify-center min-w-[36px] px-1.5 py-0.5 rounded text-[11px] font-bold ${
              isWorse
                ? 'bg-red-50 text-red-600 border border-red-200/60'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
            }`}
          >
            {delta > 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString()}
          </span>
        ) : (
          <span className="inline-flex items-center justify-center min-w-[36px] px-1.5 py-0.5 rounded text-[11px] font-medium text-gray-400 bg-white border border-gray-200">
            0
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
        {/* LEFT: Scenario Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <span className="font-bold text-xs uppercase tracking-wider text-gray-700">
              Scenario Parameters
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              Real-time multi-hazard simulation
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                resetSimulation();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                !isSimulationModified
                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Baseline
            </button>
            <button
              type="button"
              onClick={() => {
                setSimulationParams((p) => ({
                  ...p,
                  rainfallAnomalyPercent: 30,
                  riverLevelRiseMeters: 1.5,
                }));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                simulationParams.rainfallAnomalyPercent === 30 && simulationParams.riverLevelRiseMeters === 1.5
                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Moderate Monsoon (+30%)
            </button>
            <button
              type="button"
              onClick={() => {
                setSimulationParams((p) => ({
                  ...p,
                  rainfallAnomalyPercent: 75,
                  riverLevelRiseMeters: 3.5,
                  cloudburstZoneActive: true,
                }));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                simulationParams.rainfallAnomalyPercent === 75
                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Extreme Cloudburst (+75%)
            </button>
            <button
              type="button"
              onClick={() => {
                setSimulationParams((p) => ({
                  ...p,
                  simulateBridgeCollapse: !p.simulateBridgeCollapse,
                }));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                simulationParams.simulateBridgeCollapse
                  ? 'bg-red-50 text-red-600 border-red-200 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Bridge Cutoff
            </button>
          </div>

          {/* Climate & Hydrology Panel */}
          <div className="card card-border p-5 bg-white shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase text-gray-900 tracking-wider flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span>Climate &amp; Hydrological Anomaly</span>
            </h3>

            {/* Rainfall Slider */}
            <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Monsoon Precipitation Anomaly</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-white text-blue-600 border border-gray-200 shadow-xs">
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
                className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-full cursor-pointer"
                aria-label="Monsoon precipitation anomaly"
              />
              <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                <span>-20% Deficit</span>
                <span>Baseline (0%)</span>
                <span>+100% Extreme Deluge</span>
              </div>
            </div>

            {/* River Flood Crest Slider */}
            <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">River Flood Crest Rise</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-white text-blue-600 border border-gray-200 shadow-xs">
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
                className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-full cursor-pointer"
                aria-label="River flood crest elevation rise"
              />
              <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                <span>0.0m Normal Bank</span>
                <span>+2.5m Danger Level</span>
                <span>+5.0m Catastrophic Breach</span>
              </div>
            </div>

            {/* Cloudburst Switch (Ecme iOS Toggle Style) */}
            <div
              onClick={() =>
                setSimulationParams((p) => ({
                  ...p,
                  cloudburstZoneActive: !p.cloudburstZoneActive,
                }))
              }
              className="p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-between cursor-pointer shadow-xs select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-gray-900">
                    Cloudburst Convective Deluge
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Simulates localized Doppler radar deluge &gt;100mm/hr
                  </div>
                </div>
              </div>

              {/* iOS-Style Toggle Switch */}
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                  simulationParams.cloudburstZoneActive ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    simulationParams.cloudburstZoneActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Infrastructure Stress Panel */}
          <div className="card card-border p-5 bg-white shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase text-gray-900 tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Infrastructure &amp; Access Constraints</span>
            </h3>

            {/* Shelter Capacity Factor */}
            <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Shelter Intake Capacity</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-white text-blue-600 border border-gray-200 shadow-xs">
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
                className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-full cursor-pointer"
                aria-label="Shelter infrastructure viability"
              />
              <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                <span>50% Structural Loss</span>
                <span>100% Nominal</span>
                <span>120% Auxiliary Triage</span>
              </div>
            </div>

            {/* Bridge Collapse Switch (Ecme iOS Toggle Style) */}
            <div
              onClick={() =>
                setSimulationParams((p) => ({
                  ...p,
                  simulateBridgeCollapse: !p.simulateBridgeCollapse,
                }))
              }
              className="p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-between cursor-pointer shadow-xs select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-gray-900">
                    Arterial River Bridge Status
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {simulationParams.simulateBridgeCollapse
                      ? 'Bridge severed: forcing secondary mountain corridors'
                      : 'Bridge intact: primary highway transit operational'}
                  </div>
                </div>
              </div>

              {/* iOS-Style Toggle Switch */}
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                  simulationParams.simulateBridgeCollapse ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    simulationParams.simulateBridgeCollapse ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Projected Impact Analysis (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <span className="font-bold text-xs uppercase tracking-wider text-gray-700">
              Projected Impact Analysis
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              Baseline vs Scenario
            </span>
          </div>

          {/* Clean Comparative Table Card */}
          <div className="card card-border p-5 bg-white shadow-xs space-y-4">
            <div className="space-y-2">
              <ImpactRow
                label="Immediate Red-Zone Settlements"
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

            {/* Clean Info Strip */}
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 leading-relaxed flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
              <span>Real-time recalculation of risk scores, shelter allocations, and transit convoys.</span>
            </div>
          </div>

          {/* Critical Settlements Under This Scenario */}
          <div className="card card-border p-5 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-bold text-xs uppercase text-gray-900 tracking-wider">
                Critical Settlements Under Scenario ({simulatedImmediateHabs.length})
              </span>
              <span className="text-[11px] text-gray-400">Immediate evacuation</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {simulatedImmediateHabs.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  No settlements in critical zone under current scenario.
                </div>
              ) : (
                simulatedImmediateHabs.map((hab) => (
                  <div
                    key={hab.id}
                    className="p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100/80 border border-gray-200 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 text-xs">{hab.name}</div>
                      <div className="text-gray-400 text-[11px] mt-0.5">
                        {hab.population.toLocaleString()} citizens &bull; {hab.relocationAssignment?.safeSiteName || 'Relief Center'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-200/60">
                        Score {hab.calculatedRisk.overallScore}
                      </span>
                      <Link
                        href="/"
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                        title="View on map"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
  );
}
