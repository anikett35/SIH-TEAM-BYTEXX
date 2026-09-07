'use client';

import React, { useState } from 'react';
import { Habitation, SafeSite } from '@/types/disaster';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { getSeverityFromScore } from '@/components/ui/SeverityProgressBar';

interface AnalyticsPanelProps {
  habitations: Habitation[];
  safeSites: SafeSite[];
}

export default function AnalyticsPanel({ habitations, safeSites }: AnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<'risk' | 'capacity'>('risk');

  // Chart 1: Habitations Risk Score
  const riskChartData = habitations.map((h) => ({
    name: h.name.split(' ')[0],
    fullName: h.name,
    score: h.calculatedRisk.overallScore,
    severity: getSeverityFromScore(h.calculatedRisk.overallScore),
  }));

  // Chart 2: Shelter Carrying Capacity
  const capacityChartData = safeSites.map((s) => ({
    name: s.name.split(' ')[0],
    fullName: s.name,
    occupied: s.currentOccupancy + s.assignedEvacuees,
    remaining: Math.max(0, s.totalCapacity - (s.currentOccupancy + s.assignedEvacuees)),
    total: s.totalCapacity,
  }));

  const severityHex: Record<string, string> = {
    immediate: '#DC2626',
    'short-term': '#D97706',
    'medium-term': '#CA8A04',
    safe: '#059669',
  };

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-card space-y-3 shadow-card">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-slate-700 uppercase tracking-wider">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          <span>Decision analytics</span>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-control bg-slate-100 border border-slate-200 text-xs font-heading font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('risk')}
            className={`px-2.5 py-1 rounded-control transition-colors ${
              activeTab === 'risk'
                ? 'bg-brand-800 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Risk scores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('capacity')}
            className={`px-2.5 py-1 rounded-control transition-colors ${
              activeTab === 'capacity'
                ? 'bg-brand-800 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Shelter capacity
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[140px] w-full text-xs font-sans">
        {activeTab === 'risk' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskChartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[0, 100]} stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '6px',
                  color: '#0F172A',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                }}
                formatter={(val: any) => [`${val}/100`, 'Risk score']}
                labelFormatter={(_, arr) => arr[0]?.payload?.fullName || ''}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {riskChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={severityHex[entry.severity] || '#059669'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={capacityChartData} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '6px',
                  color: '#0F172A',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                }}
                labelFormatter={(_, arr) => arr[0]?.payload?.fullName || ''}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                iconSize={8}
              />
              <Bar dataKey="occupied" name="Allocated" stackId="a" fill="#334155" />
              <Bar dataKey="remaining" name="Available headroom" stackId="a" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
