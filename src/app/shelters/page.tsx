'use client';

import React, { useState, useMemo } from 'react';
import { useDisaster } from '@/context/DisasterContext';
import { SafeSite } from '@/types/disaster';
import {
  Building2,
  Droplets,
  HeartPulse,
  Phone,
  Plane,
  ShieldCheck,
  Users,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Bus,
  Search,
  Download,
  BarChart3,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import StatusBadge, { SeverityLevel } from '@/components/ui/StatusBadge';
import SeverityProgressBar from '@/components/ui/SeverityProgressBar';
import Button from '@/components/ui/Button';
import AdaptiveCard from '@/components/shared/AdaptiveCard';
import BottomSheet from '@/components/ui/BottomSheet';
import { WhatsAppLogo } from '@/components/icons/BrandLogos';
import Link from 'next/link';

function shelterStatus(available: number, ratio: number): {
  severity: SeverityLevel;
  label: string;
  isDeficit: boolean;
} {
  if (available < 0) {
    return {
      severity: 'immediate',
      label: `Deficit: ${Math.abs(available)}`,
      isDeficit: true,
    };
  }
  if (ratio >= 0.85) {
    return {
      severity: 'short-term',
      label: 'Near Capacity',
      isDeficit: false,
    };
  }
  return {
    severity: 'safe',
    label: 'Available',
    isDeficit: false,
  };
}

export default function ShelterNetworkPage() {
  const { currentRegion, processedSafeSites, processedHabitations, setSelectedSafeSite } = useDisaster();
  const [selectedSite, setSelectedSite] = useState<SafeSite | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showChart, setShowChart] = useState(false);

  // Filtered sites
  const filteredSites = useMemo(() => {
    return processedSafeSites.filter((s) => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      if (!searchTerm.trim()) return true;
      const t = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(t) ||
        s.district.toLowerCase().includes(t) ||
        s.type.toLowerCase().includes(t)
      );
    });
  }, [processedSafeSites, typeFilter, searchTerm]);

  const shelterTypes = useMemo(() => {
    return Array.from(new Set(processedSafeSites.map((s) => s.type))).sort();
  }, [processedSafeSites]);

  // Chart data
  const chartData = useMemo(() => {
    return processedSafeSites.map((s) => ({
      name: s.name.split(' ')[0],
      fullName: s.name,
      allocated: s.currentOccupancy + s.assignedEvacuees,
      headroom: Math.max(0, s.totalCapacity - (s.currentOccupancy + s.assignedEvacuees)),
      capacity: s.totalCapacity,
    }));
  }, [processedSafeSites]);

  const handleExportCSV = () => {
    const headers = [
      'Shelter ID',
      'Name',
      'Type',
      'District',
      'Elevation (m)',
      'Total Capacity',
      'Current Occupancy',
      'Assigned Evacuees',
      'Available Headroom',
      'Medical Triage',
      'Water Supply (L/day)',
      'Bus Parking Bays',
      'Helipad',
      'Officer in Charge',
      'Contact Phone',
    ];

    const rows = filteredSites.map((s) => {
      const allocated = s.currentOccupancy + s.assignedEvacuees;
      const headroom = s.totalCapacity - allocated;
      return [
        s.id,
        `"${s.name}"`,
        s.type,
        `"${s.district}"`,
        s.elevationMeters,
        s.totalCapacity,
        s.currentOccupancy,
        s.assignedEvacuees,
        headroom,
        s.hasMedicalTriage ? 'Yes' : 'No',
        s.waterSupplyLitersPerDay,
        s.busParkingCapacity,
        s.hasHelipadAccess ? 'Yes' : 'No',
        `"${s.officerInCharge.name}"`,
        `"${s.officerInCharge.phone}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ByteX_Shelters_${currentRegion.id}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDetailPanelContent = (site: SafeSite) => {
    const totalPeople = site.currentOccupancy + site.assignedEvacuees;
    const ratio = totalPeople / (site.totalCapacity || 1);
    const percent = Math.round(ratio * 100);
    const available = site.totalCapacity - totalPeople;
    const status = shelterStatus(available, ratio);

    const assignedHabs = processedHabitations.filter(
      (h) => h.relocationAssignment?.safeSiteId === site.id
    );

    return (
      <div className="space-y-4 text-xs font-sans">
        <div className="border-b border-gray-200 pb-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-sans text-[11px] text-gray-400">ID: {site.id}</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                status.severity === 'immediate'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : status.severity === 'short-term'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {status.label}
            </span>
          </div>
          <h2 className="font-bold text-base text-gray-900 mt-1 uppercase">
            {site.name}
          </h2>
          <div className="text-gray-500 text-xs mt-0.5 capitalize">
            {site.type.replace('_', ' ')} &bull; {site.district} &bull; {site.elevationMeters}m elevation
          </div>
        </div>

        {/* Capacity Breakdown */}
        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Absorption Headroom
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <div className="text-gray-400 text-[10px] uppercase">Capacity</div>
              <div className="font-sans font-bold text-gray-900 text-sm mt-0.5">
                {site.totalCapacity.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <div className="text-gray-400 text-[10px] uppercase">Occupied</div>
              <div className="font-sans font-bold text-gray-900 text-sm mt-0.5">
                {totalPeople.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <div className="text-gray-400 text-[10px] uppercase">Available</div>
              <div className={`font-sans font-extrabold text-sm mt-0.5 ${available < 0 ? 'text-error' : 'text-success'}`}>
                {available > 0 ? `+${available}` : available}
              </div>
            </div>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>Utilization</span>
              <span className="font-sans font-bold text-gray-900">{percent}%</span>
            </div>
            <SeverityProgressBar value={Math.min(100, percent)} severity={status.severity} />
          </div>
        </div>

        {/* Operational Capabilities */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Operational Capabilities
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <div className="text-gray-400 text-[10px]">Medical</div>
                <div className="font-semibold text-gray-900">
                  {site.hasMedicalTriage ? 'Triage Ready' : 'Basic First Aid'}
                </div>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <div className="text-gray-400 text-[10px]">Water Supply</div>
                <div className="font-semibold text-gray-900">
                  {(site.waterSupplyLitersPerDay / 1000).toFixed(0)}k L/day
                </div>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center gap-2">
              <Bus className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <div className="text-gray-400 text-[10px]">Bus Staging</div>
                <div className="font-semibold text-gray-900">
                  {site.busParkingCapacity} Bays
                </div>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center gap-2">
              <Plane className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <div className="text-gray-400 text-[10px]">Helipad Access</div>
                <div className="font-semibold text-gray-900">
                  {site.hasHelipadAccess ? 'Active LZ' : 'None'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inbound Convoys */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span>Inbound Settlement Convoys</span>
            <span>{assignedHabs.length} assigned</span>
          </div>

          {assignedHabs.length === 0 ? (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 text-center">
              No settlements currently routed to this shelter.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {assignedHabs.map((hab) => (
                <div
                  key={hab.id}
                  className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-gray-900 uppercase text-xs">
                      {hab.name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {hab.population.toLocaleString()} evacuees &bull; {hab.relocationAssignment?.assignedBuses} buses
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-sans font-bold text-xs text-gray-900">
                      {hab.relocationAssignment?.distanceKm} km
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {hab.relocationAssignment?.travelTimeMinutes} min ETA
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Officer in Charge */}
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Incident Command Lead
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-gray-900">{site.officerInCharge.name}</div>
              <div className="text-gray-500 text-[11px]">{site.officerInCharge.designation || site.officerInCharge.role}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                const text = encodeURIComponent(
                  `Hello Officer ${site.officerInCharge.name}, this is DEOC ByteX DSS regarding ${site.name} safe shelter readiness.`
                );
                window.open(
                  `https://api.whatsapp.com/send?phone=${site.officerInCharge.phone.replace(/[^0-9]/g, '')}&text=${text}`,
                  '_blank'
                );
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 text-[11px] font-bold transition-colors"
            >
              <WhatsAppLogo className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* GIS Action */}
        <div className="pt-2">
          <Link
            href="/"
            onClick={() => setSelectedSafeSite(site)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-deep button-press-feedback transition-colors shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Inspect on GIS Map</span>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto w-full font-sans">
      <AdaptiveCard className="p-6">
        <div className="flex flex-col gap-5">
          {/* Top Title & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Safe Shelters</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Certified evacuation relief centers, live intake absorption capacity, and logistics readiness
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant="default"
                size="sm"
                icon={<BarChart3 className="w-4 h-4" />}
                onClick={() => setShowChart(!showChart)}
              >
                {showChart ? 'Hide Chart' : 'Capacity Chart'}
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
                Shelter Allocated Intake vs Available Headroom
              </div>
              <div className="h-[200px] w-full text-xs font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -15, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 11, fill: '#4B5563' }}
                      interval={0}
                    />
                    <YAxis
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
                      labelFormatter={(_, arr) => arr[0]?.payload?.fullName || ''}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} iconSize={8} />
                    <Bar dataKey="allocated" name="Allocated Evacuees" stackId="a" fill="#1E293B" />
                    <Bar dataKey="headroom" name="Available Headroom" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
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

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by facility type"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 cursor-pointer focus:outline-none focus:bg-white focus:border-primary transition-all"
            >
              <option value="all">All facility types</option>
              {shelterTypes.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto -mx-6">
            <table className="table-default border-collapse w-full">
              <thead>
                <tr>
                  <th className="pl-6">Shelter Facility</th>
                  <th className="text-right">Capacity</th>
                  <th className="text-right">Occupied</th>
                  <th className="text-right">Available</th>
                  <th>Utilization</th>
                  <th>Medical</th>
                  <th>Water</th>
                  <th>Status</th>
                  <th className="pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {filteredSites.map((site) => {
                  const isSelected = selectedSite?.id === site.id;
                  const totalPeople = site.currentOccupancy + site.assignedEvacuees;
                  const ratio = totalPeople / (site.totalCapacity || 1);
                  const percent = Math.round(ratio * 100);
                  const available = site.totalCapacity - totalPeople;
                  const status = shelterStatus(available, ratio);

                  return (
                    <tr
                      key={site.id}
                      onClick={() => setSelectedSite(site)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-subtle/30 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="pl-6">
                        <div className="font-semibold text-xs text-gray-900">
                          {site.name}
                        </div>
                        <div className="text-[11px] text-gray-400 capitalize mt-0.5">
                          {site.type.replace('_', ' ')} &bull; {site.district}
                        </div>
                      </td>

                      <td className="text-right font-sans font-bold tabular-nums text-gray-900">
                        {site.totalCapacity.toLocaleString()}
                      </td>

                      <td className="text-right font-sans tabular-nums text-gray-700">
                        {totalPeople.toLocaleString()}
                      </td>

                      <td className="text-right font-sans font-bold tabular-nums">
                        <span className={available < 0 ? 'text-error font-extrabold' : 'text-success'}>
                          {available > 0 ? `+${available.toLocaleString()}` : available.toLocaleString()}
                        </span>
                      </td>

                      <td className="w-28">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-gray-500">
                            <span>{percent}%</span>
                          </div>
                          <SeverityProgressBar value={Math.min(100, percent)} severity={status.severity} />
                        </div>
                      </td>

                      <td>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            site.hasMedicalTriage
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {site.hasMedicalTriage ? 'Triage Ready' : 'Basic First Aid'}
                        </span>
                      </td>

                      <td className="text-[11px] text-gray-600">
                        {(site.waterSupplyLitersPerDay / 1000).toFixed(0)}k L/day
                      </td>

                      <td>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                            status.severity === 'immediate'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : status.severity === 'short-term'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="pr-6 text-right">
                        <button
                          type="button"
                          className="p-1 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
                          aria-label="Inspect shelter"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredSites.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 text-xs">
                      No shelters match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdaptiveCard>

      {/* Mobile Detail Panel as Bottom Sheet */}
      <BottomSheet
        isOpen={!!selectedSite}
        onClose={() => setSelectedSite(null)}
        title="Relief Shelter Details"
      >
        {selectedSite && renderDetailPanelContent(selectedSite)}
      </BottomSheet>
    </div>
  );
}
