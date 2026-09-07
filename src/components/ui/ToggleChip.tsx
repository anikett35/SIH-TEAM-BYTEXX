'use client';

import React, { ReactNode } from 'react';
import { SeverityLevel } from './StatusBadge';
import { Check } from 'lucide-react';

interface ToggleChipProps {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
  severity?: SeverityLevel;
  className?: string;
  showCheckmark?: boolean;
}

export default function ToggleChip({
  active,
  onClick,
  icon,
  label,
  severity,
  className = '',
  showCheckmark = true,
}: ToggleChipProps) {
  if (severity) {
    const dotStyles: Record<SeverityLevel, { dot: string }> = {
      immediate: { dot: 'bg-red-500 ring-2 ring-red-100' },
      'short-term': { dot: 'bg-amber-500 ring-2 ring-amber-100' },
      'medium-term': { dot: 'bg-yellow-500 ring-2 ring-yellow-100' },
      safe: { dot: 'bg-emerald-500 ring-2 ring-emerald-100' },
    };

    const dot = dotStyles[severity]?.dot || 'bg-slate-400';

    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-control text-xs font-heading transition-all cursor-pointer border ${
          active
            ? 'bg-white border-slate-400 text-slate-900 font-semibold shadow-sm ring-1 ring-slate-900/5'
            : 'bg-slate-50/60 border-slate-200 text-slate-600 font-medium hover:bg-slate-100/70 hover:text-slate-900 hover:border-slate-300'
        } ${className}`}
      >
        <div className="flex items-center gap-2 truncate">
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-transform ${
              active ? `${dot} scale-110` : 'bg-slate-300 scale-90'
            }`}
          />
          <span className="truncate">{label}</span>
        </div>

        {active && showCheckmark && (
          <Check className="w-3 h-3 text-slate-600 shrink-0 ml-1" />
        )}
      </button>
    );
  }

  // Non-severity ToggleChip (e.g. Routes, Channels, Languages)
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs font-heading transition-all cursor-pointer border ${
        active
          ? 'bg-brand-50 text-brand-900 border-brand-300 font-semibold shadow-sm ring-1 ring-brand-500/15'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 font-medium'
      } ${className}`}
    >
      {icon && (
        <span className={active ? 'text-brand-700' : 'text-slate-400'}>
          {icon}
        </span>
      )}
      <span className="truncate">{label}</span>
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ml-1 ${
          active ? 'bg-brand-600' : 'bg-slate-300'
        }`}
      />
    </button>
  );
}
