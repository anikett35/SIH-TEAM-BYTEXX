'use client';

import React, { ReactNode } from 'react';
import { Activity } from 'lucide-react';

export type StatSeverity = 'immediate' | 'short-term' | 'medium-term' | 'safe' | 'neutral';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: ReactNode;
  severity?: StatSeverity;
  isUrgent?: boolean;
  className?: string;
}

export default function StatCard({
  label,
  value,
  unit,
  subtext,
  icon,
  severity = 'neutral',
  isUrgent = false,
  className = '',
}: StatCardProps) {
  const activeSeverity: StatSeverity = isUrgent ? 'immediate' : severity;

  const statusPips: Record<StatSeverity, { dot: string; iconBg: string }> = {
    immediate: { dot: 'bg-red-500 ring-2 ring-red-100', iconBg: 'bg-red-50 text-red-600 border border-red-100' },
    'short-term': { dot: 'bg-amber-500 ring-2 ring-amber-100', iconBg: 'bg-amber-50 text-amber-600 border border-amber-100' },
    'medium-term': { dot: 'bg-yellow-500 ring-2 ring-yellow-100', iconBg: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
    safe: { dot: 'bg-emerald-500 ring-2 ring-emerald-100', iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
    neutral: { dot: 'bg-slate-300', iconBg: 'bg-slate-100 text-slate-600 border border-slate-200/60' },
  };

  const config = statusPips[activeSeverity] || statusPips.neutral;

  return (
    <div
      className={`group relative p-4 sm:p-5 rounded-card bg-white border border-slate-200/90 shadow-card hover:shadow-raised hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top Header Row: Symmetrical status dot + label on left, icon on right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
            <span className="font-heading text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {label}
            </span>
          </div>

          <span
            className={`w-7 h-7 rounded-control flex items-center justify-center shrink-0 transition-colors ${config.iconBg}`}
          >
            {icon || <Activity className="w-3.5 h-3.5" />}
          </span>
        </div>

        {/* Hero Metric Value: Bold, clean Outfit numerals (no awkward monospace) */}
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-[32px] font-extrabold font-heading text-slate-900 tracking-tight leading-none tabular-nums">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-slate-400 font-heading">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Anchored Subtext Footer */}
      {subtext && (
        <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-500 line-clamp-1">
          {subtext}
        </div>
      )}
    </div>
  );
}
