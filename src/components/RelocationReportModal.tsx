'use client';

import React from 'react';
import { DisasterRegion, Habitation, SafeSite } from '@/types/disaster';
import { X, Printer, Download, FileSpreadsheet } from 'lucide-react';
import Button from '@/components/ui/Button';
import StatusBadge, { normalizeSeverity } from '@/components/ui/StatusBadge';

interface RelocationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: DisasterRegion;
  habitations: Habitation[];
  safeSites: SafeSite[];
}

export default function RelocationReportModal({
  isOpen,
  onClose,
  region,
  habitations,
  safeSites,
}: RelocationReportModalProps) {
  if (!isOpen) return null;

  const immediateHabitations = habitations.filter(
    (h) => h.calculatedRisk.priority === 'Immediate'
  );

  const totalImmediatePop = immediateHabitations.reduce((acc, h) => acc + h.population, 0);
  const totalBuses = immediateHabitations.reduce(
    (acc, h) => acc + (h.relocationAssignment?.assignedBuses || 0),
    0
  );
  const totalWaterDemandLpd = totalImmediatePop * 15;

  const handleExportCSV = () => {
    const headers = [
      'Habitation ID',
      'Name',
      'District',
      'Priority',
      'Risk score',
      'Population',
      'Vulnerable count',
      'Assigned shelter',
      'Distance (km)',
      'ETA (min)',
      'Buses required',
      'Route status',
    ];

    const rows = habitations.map((h) => [
      h.id,
      `"${h.name}"`,
      `"${h.district}"`,
      h.calculatedRisk.priority,
      h.calculatedRisk.overallScore,
      h.population,
      h.vulnerableGroups.children + h.vulnerableGroups.elderly,
      `"${h.relocationAssignment?.safeSiteName || 'N/A'}"`,
      h.relocationAssignment?.distanceKm || 0,
      h.relocationAssignment?.travelTimeMinutes || 0,
      h.relocationAssignment?.assignedBuses || 0,
      h.relocationAssignment?.evacuationRouteStatus || 'N/A',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ByteX_Relocation_Manifest_${region.id}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[88vh] text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-control bg-slate-100 text-slate-700 border border-slate-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  Incident action plan: relocation manifest
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  Official NDMA format
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Operational dispatch order for {region.name} ({region.state})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => window.print()}
            >
              Print
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-control text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Manifest Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-control bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs text-slate-500">Immediate evacuees</div>
              <div className="text-2xl font-bold text-red-700 font-sans mt-0.5">
                {totalImmediatePop.toLocaleString()} <span className="text-xs font-normal text-slate-500">citizens</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Transit fleet required</div>
              <div className="text-2xl font-bold text-slate-900 font-sans mt-0.5">
                {totalBuses} <span className="text-xs font-normal text-slate-500">buses</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">WASH water supply</div>
              <div className="text-2xl font-bold text-slate-900 font-sans mt-0.5">
                {(totalWaterDemandLpd / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-500">L/day</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Designated shelters</div>
              <div className="text-2xl font-bold text-slate-900 font-sans mt-0.5">
                {safeSites.length} <span className="text-xs font-normal text-slate-500">sites</span>
              </div>
            </div>
          </div>

          {/* Habitation Evacuation Manifest Table */}
          <div>
            <h4 className="font-semibold text-sm text-slate-900 mb-2.5">
              Habitation relocation allocations
            </h4>
            <div className="rounded-control border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Habitation</th>
                    <th className="p-3">Urgency</th>
                    <th className="p-3">Population (vulnerable)</th>
                    <th className="p-3">Assigned shelter</th>
                    <th className="p-3">Distance & ETA</th>
                    <th className="p-3">Fleet</th>
                    <th className="p-3">Route status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans bg-white">
                  {habitations.map((h) => {
                    const severity = normalizeSeverity(h.calculatedRisk.priority);
                    return (
                      <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">
                          {h.name}
                          {h.localName && (
                            <span className="block text-xs text-slate-500 font-normal">
                              {h.localName}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <StatusBadge severity={severity} />
                        </td>
                        <td className="p-3 text-slate-600">
                          {h.population} ({h.vulnerableGroups.children + h.vulnerableGroups.elderly})
                        </td>
                        <td className="p-3 font-medium text-slate-900">
                          {h.relocationAssignment?.safeSiteName || 'Standby'}
                        </td>
                        <td className="p-3 text-slate-600">
                          {h.relocationAssignment?.distanceKm || 0} km, {h.relocationAssignment?.travelTimeMinutes || 0}m
                        </td>
                        <td className="p-3 text-slate-900 font-medium">
                          {h.relocationAssignment?.assignedBuses || 0} buses
                        </td>
                        <td className="p-3">
                          <StatusBadge
                            severity={normalizeSeverity(h.relocationAssignment?.evacuationRouteStatus || 'safe')}
                            label={h.relocationAssignment?.evacuationRouteStatus || 'clear'}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
