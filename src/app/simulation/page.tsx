'use client';

import React from 'react';
import { useDisaster } from '@/context/DisasterContext';
import {
  RotateCcw,
  CloudRain,
  Building,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  ArrowRightCircle,
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

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
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Disaster Simulator</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Scenario stress testing and impact projection
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
            Reset
          </Button>
          <Link href="/">
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRightCircle className="w-3.5 h-3.5" />}
            >
              View on Map
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Presets Strip */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={resetSimulation}
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
          Moderate (+30%)
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
          Severe (+75%)
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
          Bridge Cut
        </button>
      </div>

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Simulation Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card card-border p-5 bg-white shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span>Hydrology &amp; Weather</span>
            </h4>

            {/* Rainfall Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700 font-semibold">Rainfall Anomaly</span>
                <span className="font-bold text-xs text-blue-600">
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
                aria-label="Rainfall anomaly percentage"
              />
            </div>

            {/* River Flood Crest Rise Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700 font-semibold">River Crest Rise</span>
                <span className="font-bold text-xs text-blue-600">
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
                aria-label="River flood crest rise"
              />
            </div>

            {/* Cloudburst Toggle */}
            <div
              onClick={() =>
                setSimulationParams((p) => ({
                  ...p,
                  cloudburstZoneActive: !p.cloudburstZoneActive,
                }))
              }
              className="pt-2 flex items-center justify-between cursor-pointer border-t border-gray-100 select-none"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-4 h-4 ${simulationParams.cloudburstZoneActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-xs font-semibold text-gray-800">Cloudburst Deluge</span>
              </div>

              <div
                className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                  simulationParams.cloudburstZoneActive ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                    simulationParams.cloudburstZoneActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Infrastructure Card */}
          <div className="card card-border p-5 bg-white shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Infrastructure</span>
            </h4>

            {/* Shelter Viability */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700 font-semibold">Shelter Viability</span>
                <span className="font-bold text-xs text-blue-600">
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
                aria-label="Shelter viability percentage"
              />
            </div>

            {/* Bridge Cutoff Toggle */}
            <div
              onClick={() =>
                setSimulationParams((p) => ({
                  ...p,
                  simulateBridgeCollapse: !p.simulateBridgeCollapse,
                }))
              }
              className="pt-2 flex items-center justify-between cursor-pointer border-t border-gray-100 select-none"
            >
              <div className="flex items-center gap-2.5">
                <AlertOctagon className={`w-4 h-4 ${simulationParams.simulateBridgeCollapse ? 'text-red-600' : 'text-gray-400'}`} />
                <span className="text-xs font-semibold text-gray-800">Bridge Severed</span>
              </div>

              <div
                className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                  simulationParams.simulateBridgeCollapse ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                    simulationParams.simulateBridgeCollapse ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Impact Forecast (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* 4 Stat Tiles Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Tile 1: Settlements */}
            <div className="card card-border p-4 bg-white shadow-xs space-y-1">
              <div className="text-xs font-semibold text-gray-500">Critical Settlements</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-red-600">{simulatedImmediate}</span>
                {simulatedImmediate !== baselineImmediate && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                    simulatedImmediate > baselineImmediate
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {simulatedImmediate > baselineImmediate ? `+${simulatedImmediate - baselineImmediate}` : simulatedImmediate - baselineImmediate}
                  </span>
                )}
              </div>
            </div>

            {/* Tile 2: Exposed Population */}
            <div className="card card-border p-4 bg-white shadow-xs space-y-1">
              <div className="text-xs font-semibold text-gray-500">Exposed Citizens</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{simulatedPop.toLocaleString()}</span>
                {simulatedPop !== baselinePop && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                    simulatedPop > baselinePop
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {simulatedPop > baselinePop ? `+${(simulatedPop - baselinePop).toLocaleString()}` : (simulatedPop - baselinePop).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Tile 3: Shelter Headroom */}
            <div className="card card-border p-4 bg-white shadow-xs space-y-1">
              <div className="text-xs font-semibold text-gray-500">Shelter Slots</div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${headroom > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {headroom.toLocaleString()}
                </span>
                {headroom !== baselineHeadroom && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                    headroom < baselineHeadroom
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {headroom > baselineHeadroom ? `+${(headroom - baselineHeadroom).toLocaleString()}` : (headroom - baselineHeadroom).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Tile 4: Buses */}
            <div className="card card-border p-4 bg-white shadow-xs space-y-1">
              <div className="text-xs font-semibold text-gray-500">Buses Required</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{currentFleet}</span>
                {currentFleet !== baselineFleet && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                    currentFleet > baselineFleet
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {currentFleet > baselineFleet ? `+${currentFleet - baselineFleet}` : currentFleet - baselineFleet}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Settlements Under Scenario */}
          <div className="card card-border p-5 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-bold text-xs uppercase text-gray-900 tracking-wider">
                Critical Settlements ({simulatedImmediateHabs.length})
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {simulatedImmediateHabs.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  No settlements at critical risk
                </div>
              ) : (
                simulatedImmediateHabs.map((hab) => (
                  <div
                    key={hab.id}
                    className="px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100/80 border border-gray-200 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 text-xs">{hab.name}</div>
                      <div className="text-gray-400 text-[11px]">
                        {hab.population.toLocaleString()} pop &bull; {hab.district}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-200/60">
                        Score {hab.calculatedRisk.overallScore}
                      </span>
                      <Link
                        href="/"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="View on Map"
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
