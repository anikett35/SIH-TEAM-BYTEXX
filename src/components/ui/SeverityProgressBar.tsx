'use client';

import React from 'react';
import { SeverityLevel } from './StatusBadge';

interface SeverityProgressBarProps {
  value: number; // 0 to 100
  severity?: SeverityLevel;
  className?: string;
}

export function getSeverityFromScore(score: number): SeverityLevel {
  if (score >= 75) return 'immediate';
  if (score >= 50) return 'short-term';
  if (score >= 30) return 'medium-term';
  return 'safe';
}

export default function SeverityProgressBar({
  value,
  severity,
  className = '',
}: SeverityProgressBarProps) {
  const activeSeverity = severity || getSeverityFromScore(value);
  const clamped = Math.max(0, Math.min(100, value));

  const colors: Record<SeverityLevel, string> = {
    immediate: 'bg-severity-immediate',
    'short-term': 'bg-severity-short-term',
    'medium-term': 'bg-severity-medium-term',
    safe: 'bg-severity-safe',
  };

  return (
    <div
      className={`w-full h-1.5 rounded-full bg-surface-sunken overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full ${colors[activeSeverity]} rounded-full transition-all duration-300`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
