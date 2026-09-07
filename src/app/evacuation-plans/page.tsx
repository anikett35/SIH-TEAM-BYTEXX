'use client';

import React, { useState, useMemo } from 'react';
import { useDisaster } from '@/context/DisasterContext';
import {
  Printer,
  Download,
  MapPin,
  Clock,
  Bus,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Search,
  Eye,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import AdaptiveCard from '@/components/shared/AdaptiveCard';
import StatusBadge, { normalizeSeverity } from '@/components/ui/StatusBadge';

export default function EvacuationPlansPage() {
  const { currentRegion, processedHabitations, processedSafeSites } = useDisaster();
  const [activePhase, setActivePhase] = useState<'phase1' | 'phase2' | 'phase3'>('phase1');
  const [searchTerm, setSearchTerm] = useState('');

  const immediateHabs = processedHabitations.filter(
    (h) => h.calculatedRisk.priority === 'Immediate'
  );
  const shortTermHabs = processedHabitations.filter(
    (h) => h.calculatedRisk.priority === 'Short-Term'
  );
  const mediumTermHabs = processedHabitations.filter(
    (h) => h.calculatedRisk.priority === 'Medium-Term'
  );

  const currentHabs = useMemo(() => {
    let list = immediateHabs;
    if (activePhase === 'phase2') list = shortTermHabs;
    if (activePhase === 'phase3') list = mediumTermHabs;

    if (!searchTerm.trim()) return list;
    const t = searchTerm.toLowerCase();
    return list.filter(
      (h) =>
        h.name.toLowerCase().includes(t) ||
        h.district.toLowerCase().includes(t) ||
        (h.relocationAssignment?.safeSiteName &&
          h.relocationAssignment.safeSiteName.toLowerCase().includes(t))
    );
  }, [activePhase, immediateHabs, shortTermHabs, mediumTermHabs, searchTerm]);

  const handleExportCSV = () => {
    const headers = [
      'Phase',
      'Settlement',
      'Priority',
      'Population',
      'Threat Reasoning',
      'Safe Shelter Destination',
      'Distance (km)',
      'Travel Time (min)',
      'Assigned Buses',
      'Route Status',
      'Directive',
    ];

    const rows: (string | number)[][] = [];

    immediateHabs.forEach((h) => {
      rows.push([
        'Phase 1 (<6h)',
        `"${h.name}"`,
        h.calculatedRisk.priority,
        h.population,
        `"${h.calculatedRisk.primaryThreatReason}"`,
        `"${h.relocationAssignment?.safeSiteName || 'Unassigned'}"`,
        h.relocationAssignment?.distanceKm || 0,
        h.relocationAssignment?.travelTimeMinutes || 0,
        h.relocationAssignment?.assignedBuses || 0,
        h.relocationAssignment?.evacuationRouteStatus || 'safe',
        'MANDATORY CONVOY DISPATCH',
      ]);
    });

    shortTermHabs.forEach((h) => {
      rows.push([
        'Phase 2 (6-24h)',
        `"${h.name}"`,
        h.calculatedRisk.priority,
        h.population,
        `"${h.calculatedRisk.primaryThreatReason}"`,
        `"${h.relocationAssignment?.safeSiteName || 'Unassigned'}"`,
        h.relocationAssignment?.distanceKm || 0,
        h.relocationAssignment?.travelTimeMinutes || 0,
        h.relocationAssignment?.assignedBuses || 0,
        h.relocationAssignment?.evacuationRouteStatus || 'safe',
        'STAGE FLEET & MONITOR',
      ]);
    });

    const csv =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute(
      'download',
      `ByteX_IAP_${currentRegion.id}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto w-full font-sans">
      <AdaptiveCard className="p-6">
        <div className="flex flex-col gap-5">
          {/* Top Title & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Evacuation Plans</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Official NDMA-format evacuation directives, convoy staging, and transit corridors
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant="default"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => window.print()}
              >
                Print IAP
              </Button>
              <Button
                variant="default"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={handleExportCSV}
              >
                Download CSV
              </Button>
            </div>
          </div>

          {/* Phase Switcher Tabs & Quick Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-gray-100 pb-4">
            {/* Tabs */}
            {/* Phase Selector */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setActivePhase('phase1')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activePhase === 'phase1'
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Phase 1 ({immediateHabs.length})
              </button>
              <button
                type="button"
                onClick={() => setActivePhase('phase2')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activePhase === 'phase2'
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Phase 2 ({shortTermHabs.length})
              </button>
              <button
                type="button"
                onClick={() => setActivePhase('phase3')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activePhase === 'phase3'
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Phase 3 ({mediumTermHabs.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search settlement or route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          {/* Directives Table */}
          <div className="overflow-x-auto -mx-6">
            <table className="table-default border-collapse w-full">
              <thead>
                <tr>
                  <th className="pl-6">Settlement</th>
                  <th className="text-right">Population</th>
                  <th className="text-center">Risk Score</th>
                  <th>Threat Diagnostic</th>
                  <th>Destination Shelter</th>
                  <th className="text-right">Buses</th>
                  <th>Corridor</th>
                  <th className="pr-6">Directive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {currentHabs.map((hab) => {
                  const severity = normalizeSeverity(hab.calculatedRisk.priority);

                  return (
                    <tr key={hab.id} className="hover:bg-gray-50 transition-colors">
                      <td className="pl-6">
                        <div className="font-semibold text-xs text-gray-900">
                          {hab.name}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {hab.district} &bull; {hab.elevationMeters}m
                        </div>
                      </td>

                      <td className="text-right font-sans font-bold tabular-nums text-gray-900">
                        {hab.population.toLocaleString()}
                      </td>

                      <td className="text-center font-sans font-bold tabular-nums">
                        <span
                          className={
                            severity === 'immediate'
                              ? 'text-error'
                              : severity === 'short-term'
                              ? 'text-amber-600'
                              : 'text-gray-700'
                          }
                        >
                          {hab.calculatedRisk.overallScore}
                        </span>
                      </td>

                      <td className="text-xs text-gray-600 max-w-[240px] truncate" title={hab.calculatedRisk.primaryThreatReason}>
                        {hab.calculatedRisk.primaryThreatReason}
                      </td>

                      <td>
                        <div className="font-semibold text-gray-900 text-xs">
                          {hab.relocationAssignment?.safeSiteName || 'Standby LZ'}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {hab.relocationAssignment?.distanceKm} km &bull; {hab.relocationAssignment?.travelTimeMinutes} min ETA
                        </div>
                      </td>

                      <td className="text-right font-sans font-bold tabular-nums text-gray-800">
                        {hab.relocationAssignment?.assignedBuses ?? 0}
                      </td>

                      <td className="whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold ${
                            hab.relocationAssignment?.evacuationRouteStatus === 'blocked'
                              ? 'bg-red-50 text-red-600 border border-red-200/60'
                              : hab.relocationAssignment?.evacuationRouteStatus === 'caution'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                          }`}
                        >
                          {hab.relocationAssignment?.evacuationRouteStatus === 'blocked'
                            ? 'Blocked'
                            : hab.relocationAssignment?.evacuationRouteStatus === 'caution'
                            ? 'Caution'
                            : 'Open'}
                        </span>
                      </td>

                      <td className="pr-6 whitespace-nowrap">
                        <StatusBadge
                          severity={
                            activePhase === 'phase1'
                              ? 'immediate'
                              : activePhase === 'phase2'
                              ? 'short-term'
                              : 'safe'
                          }
                          label={
                            activePhase === 'phase1'
                              ? 'Evacuate'
                              : activePhase === 'phase2'
                              ? 'Stage Fleet'
                              : 'Monitor'
                          }
                        />
                      </td>
                    </tr>
                  );
                })}

                {currentHabs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                      No settlements staged in this evacuation phase.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdaptiveCard>
    </div>
  );
}
