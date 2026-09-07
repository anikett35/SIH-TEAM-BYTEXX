'use client';

import React from 'react';
import { Habitation, SafeSite } from '@/types/disaster';
import { AlertCircle, Users, ShieldCheck, Truck } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

interface StatSummaryProps {
  habitations: Habitation[];
  safeSites: SafeSite[];
}

export default function StatSummary({ habitations, safeSites }: StatSummaryProps) {
  const immediateHabitations = habitations.filter(
    (h) => h.calculatedRisk.priority === 'Immediate'
  );
  const shortTermHabitations = habitations.filter(
    (h) => h.calculatedRisk.priority === 'Short-Term'
  );

  const totalPopAtRisk = habitations
    .filter((h) => h.calculatedRisk.priority !== 'Low')
    .reduce((acc, h) => acc + h.population, 0);

  const immediatePop = immediateHabitations.reduce((acc, h) => acc + h.population, 0);

  const totalCapacity = safeSites.reduce((acc, s) => acc + s.totalCapacity, 0);
  const totalOccupiedAndAssigned = safeSites.reduce(
    (acc, s) => acc + s.currentOccupancy + s.assignedEvacuees,
    0
  );
  const headroom = Math.max(0, totalCapacity - totalOccupiedAndAssigned);

  const totalBuses = immediateHabitations.reduce(
    (acc, h) => acc + (h.relocationAssignment?.assignedBuses || 0),
    0
  );

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-2 shrink-0">
      {/* Focused Operational Ticker (4 clean, professional metric cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Immediate red zones"
          value={immediateHabitations.length}
          unit="settlements"
          subtext={`${immediatePop.toLocaleString()} citizens under order`}
          severity="immediate"
          icon={<AlertCircle className="w-4 h-4" />}
        />

        <StatCard
          label="Short-term watch"
          value={shortTermHabitations.length}
          unit="settlements"
          subtext={`${totalPopAtRisk.toLocaleString()} citizens monitored`}
          severity="short-term"
          icon={<Users className="w-4 h-4" />}
        />

        <StatCard
          label="Shelter headroom"
          value={headroom.toLocaleString()}
          unit="slots"
          subtext={`Capacity: ${totalCapacity.toLocaleString()} beds`}
          severity={headroom === 0 ? 'immediate' : headroom < 300 ? 'short-term' : 'safe'}
          icon={<ShieldCheck className="w-4 h-4" />}
        />

        <StatCard
          label="Fleet deployed"
          value={totalBuses}
          unit="buses"
          subtext="Assigned across depots"
          severity="neutral"
          icon={<Truck className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}
