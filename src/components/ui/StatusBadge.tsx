'use client';

import React from 'react';

export type SeverityLevel = 'immediate' | 'short-term' | 'medium-term' | 'safe';

interface StatusBadgeProps {
  severity: SeverityLevel;
  label?: string;
  className?: string;
}

export function normalizeSeverity(status: string): SeverityLevel {
  const s = status.toLowerCase();
  if (
    s.includes('immediate') ||
    s.includes('critical') ||
    s.includes('submerged') ||
    s.includes('cutoff') ||
    s.includes('deficit') ||
    s.includes('overflow') ||
    s.includes('blocked')
  ) {
    return 'immediate';
  }
  if (
    s.includes('short') ||
    s.includes('threatened') ||
    s.includes('near') ||
    s.includes('caution') ||
    s.includes('watch')
  ) {
    return 'short-term';
  }
  if (s.includes('medium')) {
    return 'medium-term';
  }
  return 'safe';
}

export default function StatusBadge({
  severity,
  label,
  className = '',
}: StatusBadgeProps) {
  const styles: Record<SeverityLevel, string> = {
    immediate: 'bg-red-50 text-red-600 border border-red-200/60',
    'short-term': 'bg-amber-50 text-amber-600 border border-amber-200/60',
    'medium-term': 'bg-blue-50 text-blue-600 border border-blue-200/60',
    safe: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
  };

  const defaultLabels: Record<SeverityLevel, string> = {
    immediate: 'Immediate',
    'short-term': 'Short-Term',
    'medium-term': 'Medium-Term',
    safe: 'Low',
  };

  const style = styles[severity] || styles.safe;
  const displayLabel = label || defaultLabels[severity] || defaultLabels.safe;

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-semibold leading-none min-w-[76px] text-center transition-colors ${style} ${className}`}
    >
      {displayLabel}
    </span>
  );
}

