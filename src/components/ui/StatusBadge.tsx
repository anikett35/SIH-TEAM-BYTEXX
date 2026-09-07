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
    immediate: 'bg-rose-500/15 text-rose-300 border border-rose-400/40 shadow-[0_0_10px_rgba(255,51,79,.12)]',
    'short-term': 'bg-orange-400/15 text-orange-300 border border-orange-300/40 shadow-[0_0_10px_rgba(255,159,30,.1)]',
    'medium-term': 'bg-cyan-400/15 text-cyan-300 border border-cyan-300/35 shadow-[0_0_10px_rgba(0,184,255,.1)]',
    safe: 'bg-emerald-400/15 text-emerald-300 border border-emerald-300/40 shadow-[0_0_10px_rgba(0,208,132,.1)]',
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

