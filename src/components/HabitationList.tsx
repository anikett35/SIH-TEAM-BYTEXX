'use client';

import React, { useState } from 'react';
import { Habitation, PriorityLevel } from '@/types/disaster';
import { Search, ChevronRight, Bus, MapPin } from 'lucide-react';

import AdaptiveCard from '@/components/shared/AdaptiveCard';

interface HabitationListProps {
  habitations: Habitation[];
  selectedHabitation: Habitation | null;
  onSelectHabitation: (hab: Habitation | null) => void;
  activePriorityFilters: Record<PriorityLevel, boolean>;
}

export default function HabitationList({
  habitations,
  selectedHabitation,
  onSelectHabitation,
  activePriorityFilters,
}: HabitationListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHabitations = habitations.filter((hab) => {
    if (!activePriorityFilters[hab.calculatedRisk.priority]) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      hab.name.toLowerCase().includes(term) ||
      (hab.localName && hab.localName.toLowerCase().includes(term)) ||
      hab.district.toLowerCase().includes(term) ||
      (hab.relocationAssignment?.safeSiteName &&
        hab.relocationAssignment.safeSiteName.toLowerCase().includes(term))
    );
  });

  const immediateCount = habitations.filter(
    (h) => h.calculatedRisk.priority === 'Immediate'
  ).length;

  return (
    <AdaptiveCard className="overflow-hidden">
      {/* Table Controls Bar */}
      <div className="p-5 border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Affected Settlements
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Operational priority queue and evacuation readiness manifest
          </p>
        </div>

        {/* Template Input Search Box */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Quick search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-primary transition-all font-medium"
          />
        </div>
      </div>

      {/* Operational Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-600 border-collapse table-default">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-6">Settlement & Ward</th>
              <th className="py-3 px-4 text-center">Risk Score</th>
              <th className="py-3 px-4">Urgency</th>
              <th className="py-3 px-4 text-right">Population</th>
              <th className="py-3 px-6">Relocation Destination</th>
              <th className="py-3 px-4 text-right">Distance</th>
              <th className="py-3 px-4 text-right">Fleet</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredHabitations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 text-xs">
                  No settlements match the active filters or search terms.
                </td>
              </tr>
            ) : (
              filteredHabitations.map((hab) => {
                const isSelected = selectedHabitation?.id === hab.id;
                const isImmediate = hab.calculatedRisk.priority === 'Immediate';
                const isShortTerm = hab.calculatedRisk.priority === 'Short-Term';

                const priorityBadge = (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                      isImmediate
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : isShortTerm
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isImmediate
                      ? 'Immediate (<6h)'
                      : isShortTerm
                      ? 'Short-term (24h)'
                      : 'Monitoring'}
                  </span>
                );

                return (
                  <tr
                    key={hab.id}
                    onClick={() => onSelectHabitation(isSelected ? null : hab)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary-subtle/30 text-gray-900 border-l-4 border-l-primary'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {/* Settlement Name */}
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-gray-900 leading-tight">
                        {hab.name}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {hab.localName ? `${hab.localName} &bull; ` : ''}
                        {hab.district}
                      </div>
                    </td>

                    {/* Risk Score - Clean Numerical Tabular */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-sans tabular-nums font-bold text-xs text-gray-900">
                        {hab.calculatedRisk.overallScore}
                      </span>
                    </td>

                    {/* Urgency */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{priorityBadge}</td>

                    {/* Population */}
                    <td className="py-3.5 px-4 text-right font-sans tabular-nums font-semibold text-gray-900 whitespace-nowrap">
                      {hab.population.toLocaleString()}
                    </td>

                    {/* Destination */}
                    <td className="py-3.5 px-6 min-w-[180px]">
                      {hab.relocationAssignment ? (
                        <div>
                          <div className="font-medium text-gray-900 text-xs truncate max-w-[200px]">
                            {hab.relocationAssignment.safeSiteName}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                            <span
                              className={`font-semibold capitalize ${
                                hab.relocationAssignment.evacuationRouteStatus === 'blocked'
                                  ? 'text-error'
                                  : 'text-success'
                              }`}
                            >
                              Route {hab.relocationAssignment.evacuationRouteStatus}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Distance */}
                    <td className="py-3.5 px-4 text-right font-sans text-gray-700 tabular-nums whitespace-nowrap">
                      {hab.relocationAssignment
                        ? `${hab.relocationAssignment.distanceKm} km`
                        : '—'}
                    </td>

                    {/* Fleet Required */}
                    <td className="py-3.5 px-4 text-right font-sans tabular-nums whitespace-nowrap">
                      {hab.relocationAssignment ? (
                        <span className="font-semibold text-gray-900">
                          {hab.relocationAssignment.assignedBuses}{' '}
                          <span className="text-[10px] text-gray-400 font-normal">buses</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Action Indicator */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectHabitation(isSelected ? null : hab);
                        }}
                        className={`p-1 rounded-lg transition-colors ${
                          isSelected
                            ? 'text-primary bg-primary-subtle'
                            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        aria-label="Inspect settlement"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdaptiveCard>
  );
}
