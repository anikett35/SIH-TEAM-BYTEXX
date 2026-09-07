'use client';

import React, { useMemo, useState } from 'react';
import { useDisaster } from '@/context/DisasterContext';
import { Habitation } from '@/types/disaster';
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  MapPin,
  AlertTriangle,
  Send,
  BarChart3,
  ChevronRight,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import StatusBadge, { normalizeSeverity } from '@/components/ui/StatusBadge';
import SeverityProgressBar from '@/components/ui/SeverityProgressBar';
import Button from '@/components/ui/Button';
import AdaptiveCard from '@/components/shared/AdaptiveCard';
import BottomSheet from '@/components/ui/BottomSheet';
import EmergencyAlertModal from '@/components/EmergencyAlertModal';
import Link from 'next/link';

export default function RiskMatrixPage() {
  const { currentRegion, processedHabitations, setSelectedHabitation } = useDisaster();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'score' | 'population' | 'name'>('score');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedHab, setSelectedHab] = useState<Habitation | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const districts = useMemo(
    () => Array.from(new Set(processedHabitations.map((h) => h.district))).sort(),
    [processedHabitations]
  );

  // Filter & Sort
  const filtered = useMemo(() => {
    return processedHabitations
      .filter((h) => {
        if (priorityFilter !== 'all' && h.calculatedRisk.priority !== priorityFilter) return false;
        if (districtFilter !== 'all' && h.district !== districtFilter) return false;
        if (!searchTerm.trim()) return true;
        const t = searchTerm.toLowerCase();
        return (
          h.name.toLowerCase().includes(t) ||
          (h.localName && h.localName.toLowerCase().includes(t)) ||
          h.district.toLowerCase().includes(t)
        );
      })
      .sort((a, b) => {
        let res = 0;
        if (sortField === 'score') res = a.calculatedRisk.overallScore - b.calculatedRisk.overallScore;
        else if (sortField === 'population') res = a.population - b.population;
        else res = a.name.localeCompare(b.name);
        return sortAsc ? res : -res;
      });
  }, [processedHabitations, priorityFilter, districtFilter, searchTerm, sortField, sortAsc]);

  // Graph Data
  const chartData = useMemo(() => {
    return processedHabitations.map((h) => ({
      name: h.name.split(' ')[0],
      fullName: h.name,
      score: h.calculatedRisk.overallScore,
      priority: h.calculatedRisk.priority,
    }));
  }, [processedHabitations]);

  const priorityColors: Record<string, string> = {
    Immediate: '#DC2626',
    'Short-Term': '#D97706',
    'Medium-Term': '#CA8A04',
    Low: '#16A34A',
  };

  const handleExportCSV = () => {
    const headers = [
      'Settlement',
      'Local name',
      'District',
      'Elevation (m)',
      'Risk Category',
      'Composite Risk Score',
      'Hazard Index (40%)',
      'Physical Vulnerability (25%)',
      'Demographic Exposure (20%)',
      'Isolation Deficit (15%)',
      'Population',
      'Households',
      'Vulnerable (Children+Elderly)',
      'Kutcha Houses %',
      'PHC Dist (km)',
      'Bridge Status',
      'Recommended Action',
      'Assigned Safe Shelter',
      'Evacuation Distance (km)',
      'Transit ETA (min)',
    ];

    const rows = filtered.map((h) => [
      `"${h.name}"`,
      `"${h.localName || ''}"`,
      `"${h.district}"`,
      h.elevationMeters,
      h.calculatedRisk.priority,
      h.calculatedRisk.overallScore,
      h.calculatedRisk.hazardFactor,
      h.calculatedRisk.vulnerabilityFactor,
      h.calculatedRisk.exposureFactor,
      h.calculatedRisk.copingDeficitFactor,
      h.population,
      h.households,
      h.vulnerableGroups.children + h.vulnerableGroups.elderly,
      h.infrastructure.kutchaHousesPercent,
      h.infrastructure.primaryHealthCenterDistanceKm,
      h.infrastructure.bridgeAccessStatus,
      h.calculatedRisk.priority === 'Immediate'
        ? 'EVACUATE WITHIN 6 HOURS'
        : h.calculatedRisk.priority === 'Short-Term'
        ? 'STAGE FLEET & MONITOR'
        : h.calculatedRisk.priority === 'Medium-Term'
        ? 'PLAN MITIGATION'
        : 'ROUTINE MONITORING',
      `"${h.relocationAssignment?.safeSiteName || 'N/A'}"`,
      h.relocationAssignment?.distanceKm || 0,
      h.relocationAssignment?.travelTimeMinutes || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ByteX_RiskMatrix_${currentRegion.id}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDetailPanelContent = (hab: Habitation) => {
    const severity = normalizeSeverity(hab.calculatedRisk.priority);
    const actionText =
      hab.calculatedRisk.priority === 'Immediate'
        ? 'EVACUATE WITHIN 6 HOURS'
        : hab.calculatedRisk.priority === 'Short-Term'
        ? 'STAGE FLEET & MONITOR (6–24H)'
        : hab.calculatedRisk.priority === 'Medium-Term'
        ? 'PLAN ADAPTATION & DIVERSION'
        : 'ROUTINE SENTINEL MONITORING';

    const score = hab.calculatedRisk.overallScore;

    return (
      <div className="space-y-4 text-xs font-sans">
        {/* Header */}
        <div className="border-b border-gray-200 pb-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-sans text-[11px] text-gray-400">ID: {hab.id}</span>
            <StatusBadge severity={severity} label={hab.calculatedRisk.priority} />
          </div>
          <h2 className="font-bold text-base text-gray-900 mt-1 uppercase">
            {hab.name}
          </h2>
          {hab.localName && (
            <p className="text-gray-500 text-xs mt-0.5">{hab.localName}</p>
          )}
          <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>{hab.district} &bull; {hab.elevationMeters}m MSL</span>
          </div>
        </div>

        {/* Action Directive */}
        <div
          className={`p-3 rounded-xl border font-sans font-bold flex items-center justify-between ${
            severity === 'immediate'
              ? 'bg-error-subtle/30 border-error/20 text-error'
              : severity === 'short-term'
              ? 'bg-warning-subtle/30 border-warning/20 text-amber-700'
              : 'bg-gray-100 border-gray-200 text-gray-700'
          }`}
        >
          <span>COMMAND: {actionText}</span>
          <span className="font-sans text-sm font-extrabold">{score}/100</span>
        </div>

        {/* Primary Threat */}
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            <span>Primary Threat Diagnostic</span>
          </div>
          <p className="text-gray-700 leading-relaxed font-medium">
            {hab.calculatedRisk.primaryThreatReason}
          </p>
        </div>

        {/* 4-Factor Breakdown */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Risk Factor Contribution Breakdown
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>0.40 &times; Hazard Index (Flood &amp; Landslide)</span>
                <span className="font-sans font-bold tabular-nums text-gray-900">
                  {hab.calculatedRisk.hazardFactor} / 100
                </span>
              </div>
              <SeverityProgressBar value={hab.calculatedRisk.hazardFactor} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>0.25 &times; Physical Vulnerability (Kutcha, Bridge, PHC)</span>
                <span className="font-sans font-bold tabular-nums text-gray-900">
                  {hab.calculatedRisk.vulnerabilityFactor} / 100
                </span>
              </div>
              <SeverityProgressBar value={hab.calculatedRisk.vulnerabilityFactor} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>0.20 &times; Demographic Exposure (Dependents ratio)</span>
                <span className="font-sans font-bold tabular-nums text-gray-900">
                  {hab.calculatedRisk.exposureFactor} / 100
                </span>
              </div>
              <SeverityProgressBar value={hab.calculatedRisk.exposureFactor} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>0.15 &times; Isolation Deficit (Access &amp; transit delay)</span>
                <span className="font-sans font-bold tabular-nums text-gray-900">
                  {hab.calculatedRisk.copingDeficitFactor} / 100
                </span>
              </div>
              <SeverityProgressBar value={hab.calculatedRisk.copingDeficitFactor} />
            </div>
          </div>
        </div>

        {/* Mathematical Formulation */}
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Mathematical Formulation
          </div>
          <div className="font-mono text-[11px] text-gray-700 bg-white p-2 rounded-lg border border-gray-200 leading-relaxed">
            Risk Score = 0.40(Hazard) + 0.25(Vulnerability) + 0.20(Exposure) + 0.15(Isolation)
          </div>
        </div>

        {/* Assigned Destination */}
        {hab.relocationAssignment && (
          <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1.5">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Assigned Evacuation Destination
            </div>
            <div className="font-bold text-gray-900 text-xs">
              {hab.relocationAssignment.safeSiteName}
            </div>
            <div className="flex items-center justify-between text-gray-600 text-[11px]">
              <span>Distance: <strong>{hab.relocationAssignment.distanceKm} km</strong></span>
              <span>ETA: <strong>{hab.relocationAssignment.travelTimeMinutes} min</strong></span>
              <span>Fleet: <strong>{hab.relocationAssignment.assignedBuses} buses</strong></span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/"
            onClick={() => setSelectedHabitation(hab)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-deep button-press-feedback transition-colors shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Locate on GIS Command Map</span>
          </Link>

          {hab.calculatedRisk.priority === 'Immediate' && (
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              icon={<Send className="w-3.5 h-3.5" />}
              onClick={() => setIsAlertModalOpen(true)}
            >
              Dispatch Immediate Convoy Directive
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto w-full font-sans">
      {/* Primary Adaptive Card — EXACTLY matching ecme-next customer-list */}
      <AdaptiveCard className="p-6">
        <div className="flex flex-col gap-5">
          {/* Top Title & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Village Risk Matrix</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Multi-hazard vulnerability scores, demographic exposure, and evacuation directives
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant="default"
                size="sm"
                icon={<BarChart3 className="w-4 h-4" />}
                onClick={() => setShowChart(!showChart)}
              >
                {showChart ? 'Hide Chart' : 'Risk Chart'}
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

          {/* Collapsible Chart View inside Card */}
          {showChart && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="text-xs font-bold text-gray-700 mb-2">
                Settlement Composite Risk Distribution
              </div>
              <div className="h-[180px] w-full text-xs font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 11, fill: '#4B5563' }}
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#9CA3AF"
                      tick={{ fontSize: 11, fill: '#4B5563' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E7EB',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                      formatter={(val: any) => [`${val} / 100`, 'Risk Score']}
                      labelFormatter={(_, arr) => arr[0]?.payload?.fullName || ''}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={priorityColors[entry.priority] || '#3B82F6'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Quick Search */}
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

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                aria-label="Filter by district"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 cursor-pointer focus:outline-none focus:bg-white focus:border-primary transition-all"
              >
                <option value="all">All districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter by category"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 cursor-pointer focus:outline-none focus:bg-white focus:border-primary transition-all"
              >
                <option value="all">All categories</option>
                <option value="Immediate">Immediate (&lt;6h)</option>
                <option value="Short-Term">Short-term watch</option>
                <option value="Medium-Term">Medium-term</option>
                <option value="Low">Low / resilient</option>
              </select>

              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                aria-label="Sort habitations"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 cursor-pointer focus:outline-none focus:bg-white focus:border-primary transition-all"
              >
                <option value="score">Sort by Risk score</option>
                <option value="population">Sort by Population</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Clean Data Table */}
          <div className="overflow-x-auto -mx-6">
            <table className="table-default border-collapse w-full">
              <thead>
                <tr>
                  <th className="pl-6">Settlement</th>
                  <th>Hazard Index</th>
                  <th>Physical Vuln</th>
                  <th>Demographic</th>
                  <th>Isolation</th>
                  <th className="text-center">Score</th>
                  <th>Category</th>
                  <th>Directive</th>
                  <th className="pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {filtered.map((hab) => {
                  const isSelected = selectedHab?.id === hab.id;
                  const severity = normalizeSeverity(hab.calculatedRisk.priority);
                  const score = hab.calculatedRisk.overallScore;

                  const action =
                    hab.calculatedRisk.priority === 'Immediate'
                      ? 'Evacuate'
                      : hab.calculatedRisk.priority === 'Short-Term'
                      ? 'Stage Fleet'
                      : hab.calculatedRisk.priority === 'Medium-Term'
                      ? 'Mitigation'
                      : 'Routine Watch';

                  return (
                    <tr
                      key={hab.id}
                      onClick={() => setSelectedHab(hab)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/50 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Settlement */}
                      <td className="pl-6">
                        <div className="font-semibold text-xs text-gray-900">
                          {hab.name}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {hab.district} &bull; {hab.elevationMeters}m
                        </div>
                      </td>

                      {/* Hazard */}
                      <td className="text-[11px]">
                        <div className="text-gray-800">
                          Flood: <strong className="font-sans font-bold tabular-nums text-gray-900">{hab.hazardExposure.floodIndex}%</strong>
                        </div>
                        <div className="text-gray-500">
                          Slide: <strong className="font-sans font-bold tabular-nums text-gray-900">{hab.hazardExposure.landslideSusceptibility}%</strong>
                        </div>
                      </td>

                      {/* Physical Vulnerability */}
                      <td className="text-[11px]">
                        <div className="text-gray-800">
                          Kutcha: <strong className="font-sans font-bold tabular-nums text-gray-900">{hab.infrastructure.kutchaHousesPercent}%</strong>
                        </div>
                        <div className="text-gray-500">
                          Bridge: <span className="capitalize">{hab.infrastructure.bridgeAccessStatus.replace('_', ' ')}</span>
                        </div>
                      </td>

                      {/* Demographic Exposure */}
                      <td className="text-[11px]">
                        <div className="font-semibold text-gray-900 font-sans tabular-nums">
                          {hab.population.toLocaleString()} pop
                        </div>
                        <div className="text-gray-400">
                          Dep: {hab.vulnerableGroups.children + hab.vulnerableGroups.elderly}
                        </div>
                      </td>

                      {/* Isolation Deficit */}
                      <td className="text-[11px] text-gray-700 font-sans tabular-nums">
                        {hab.calculatedRisk.copingDeficitFactor}/100
                      </td>

                      {/* Risk Score */}
                      <td className="text-center">
                        <span className="font-sans font-bold text-xs text-gray-900">
                          {score}
                        </span>
                      </td>

                      {/* Category */}
                      <td>
                        <StatusBadge severity={severity} label={hab.calculatedRisk.priority} />
                      </td>

                      {/* Action */}
                      <td>
                        <span
                          className={`font-semibold text-xs tracking-tight ${
                            severity === 'immediate'
                              ? 'text-red-600 font-bold'
                              : severity === 'short-term'
                              ? 'text-amber-600 font-bold'
                              : 'text-gray-600'
                          }`}
                        >
                          {action}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="pr-6 text-right">
                        <button
                          type="button"
                          className="p-1 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
                          aria-label="Inspect settlement"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 text-xs">
                      No settlements match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdaptiveCard>

      {/* Mobile / Click Inspection Bottom Sheet */}
      <BottomSheet
        isOpen={!!selectedHab}
        onClose={() => setSelectedHab(null)}
        title="Settlement Risk Assessment"
      >
        {selectedHab && renderDetailPanelContent(selectedHab)}
      </BottomSheet>

      {/* Emergency Alert Modal */}
      <EmergencyAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        targetHabitations={processedHabitations.filter(
          (h) => h.calculatedRisk.priority === 'Immediate'
        )}
      />
    </div>
  );
}
