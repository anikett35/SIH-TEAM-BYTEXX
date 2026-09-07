'use client';

import React from 'react';
import { SafeSite } from '@/types/disaster';
import { Building2, Droplets, HeartPulse, Phone, Plane } from 'lucide-react';
import StatusBadge, { SeverityLevel } from '@/components/ui/StatusBadge';
import SeverityProgressBar from '@/components/ui/SeverityProgressBar';

interface ShelterMonitorProps {
  safeSites: SafeSite[];
  selectedSafeSite: SafeSite | null;
  onSelectSafeSite: (site: SafeSite | null) => void;
}

export default function ShelterMonitor({
  safeSites,
  selectedSafeSite,
  onSelectSafeSite,
}: ShelterMonitorProps) {
  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-card overflow-hidden shadow-card">
      <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span className="font-heading text-xs font-bold text-slate-700 uppercase tracking-wider">
            Safe shelters & capacity
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 font-sans">
          {safeSites.length} sites
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {safeSites.map((site) => {
          const isSelected = selectedSafeSite?.id === site.id;
          const totalOccupied = site.currentOccupancy + site.assignedEvacuees;
          const ratio = totalOccupied / (site.totalCapacity || 1);
          const percent = Math.min(100, Math.round(ratio * 100));

          let severity: SeverityLevel = 'safe';
          let label = 'Available';

          if (ratio > 1.0) {
            severity = 'immediate';
            label = 'Deficit';
          } else if (ratio >= 0.85) {
            severity = 'short-term';
            label = 'Near capacity';
          }

          return (
            <div
              key={site.id}
              onClick={() => onSelectSafeSite(isSelected ? null : site)}
              className={`p-3.5 rounded-control border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-50/90 border-brand-700 shadow-sm ring-1 ring-brand-700/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-heading font-bold text-sm text-slate-900">
                    {site.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 capitalize">
                    {site.type.replace('_', ' ')}, Elev: {site.elevationMeters}m
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <StatusBadge severity={severity} label={label} />
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    <strong className="text-slate-900">{totalOccupied}</strong> / {site.totalCapacity}
                  </div>
                </div>
              </div>

              {/* Headroom Progress Bar */}
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Occupancy ({percent}%)</span>
                  <span>
                    Remaining:{' '}
                    <strong className={site.totalCapacity - totalOccupied < 0 ? 'text-red-700 font-semibold' : 'text-slate-900 font-semibold'}>
                      {Math.max(0, site.totalCapacity - totalOccupied)} slots
                    </strong>
                  </span>
                </div>
                <SeverityProgressBar value={percent} severity={severity} />
              </div>

              {/* Infrastructure details */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-50 border border-slate-100">
                  <Droplets className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{site.waterSupplyLitersPerDay / 1000}k L/d</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-50 border border-slate-100">
                  <HeartPulse className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{site.hasMedicalTriage ? 'Triage ready' : 'Basic aid'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-50 border border-slate-100">
                  <Plane className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{site.hasEmergencyHelipad ? 'Helipad' : 'Road only'}</span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="truncate">Officer: {site.officerInCharge.name}</span>
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {site.officerInCharge.phone}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
