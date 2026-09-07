'use client';

import React from 'react';
import { Habitation, SafeSite } from '@/types/disaster';

interface OperationalSnapshotProps {
  habitations: Habitation[];
  safeSites: SafeSite[];
}

export default function OperationalSnapshot({ habitations, safeSites }: OperationalSnapshotProps) {
  const immediateHabs = habitations.filter(
    (h) => h.calculatedRisk.priority === 'Immediate'
  );
  const shortTermHabs = habitations.filter(
    (h) => h.calculatedRisk.priority === 'Short-Term'
  );

  const totalMonitoredPop = habitations
    .filter((h) => h.calculatedRisk.priority !== 'Low')
    .reduce((acc, h) => acc + h.population, 0);

  const immediatePop = immediateHabs.reduce((acc, h) => acc + h.population, 0);

  const totalCapacity = safeSites.reduce((acc, s) => acc + s.totalCapacity, 0);
  const totalOccupiedAndAssigned = safeSites.reduce(
    (acc, s) => acc + s.currentOccupancy + s.assignedEvacuees,
    0
  );
  const headroom = Math.max(0, totalCapacity - totalOccupiedAndAssigned);

  const totalBuses = immediateHabs.reduce(
    (acc, h) => acc + (h.relocationAssignment?.assignedBuses || 0),
    0
  );

  return (
    <div className="w-full bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-2.5 shrink-0 font-sans">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 text-xs">
        {/* CRITICAL */}
        <div className="py-1 lg:py-0 px-2 lg:px-4 flex items-center justify-between lg:justify-start gap-2.5">
          <span className="w-2 h-2 rounded-full bg-error shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block leading-none">
              Critical
            </span>
            <div className="text-gray-900 font-semibold mt-0.5 truncate text-[11px] sm:text-xs">
              <strong className="font-sans font-bold tabular-nums text-error">{immediateHabs.length} settlements</strong>,{' '}
              <span className="text-gray-500">{immediatePop.toLocaleString()} people</span>
            </div>
          </div>
        </div>

        {/* WATCH */}
        <div className="py-1 lg:py-0 px-2 lg:px-4 flex items-center justify-between lg:justify-start gap-2.5">
          <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block leading-none">
              Watch
            </span>
            <div className="text-gray-900 font-semibold mt-0.5 truncate text-[11px] sm:text-xs">
              <strong className="font-sans font-bold tabular-nums text-warning">{shortTermHabs.length} settlements</strong>,{' '}
              <span className="text-gray-500">{totalMonitoredPop.toLocaleString()} monitored</span>
            </div>
          </div>
        </div>

        {/* HEADROOM */}
        <div className="py-1 lg:py-0 px-2 lg:px-4 flex items-center justify-between lg:justify-start gap-2.5">
          <span className="w-2 h-2 rounded-full bg-success shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block leading-none">
              Headroom
            </span>
            <div className="text-gray-900 font-semibold mt-0.5 truncate text-[11px] sm:text-xs">
              <strong className="font-sans font-bold tabular-nums text-gray-900">{headroom.toLocaleString()} slots</strong>,{' '}
              <span className="text-gray-500">{totalCapacity.toLocaleString()} total cap</span>
            </div>
          </div>
        </div>

        {/* FLEET */}
        <div className="py-1 lg:py-0 px-2 lg:px-4 flex items-center justify-between lg:justify-start gap-2.5">
          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block leading-none">
              Fleet
            </span>
            <div className="text-gray-900 font-semibold mt-0.5 truncate text-[11px] sm:text-xs">
              <strong className="font-sans font-bold tabular-nums text-gray-900">{totalBuses} buses</strong>,{' '}
              <span className="text-gray-500">Staged for transit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
