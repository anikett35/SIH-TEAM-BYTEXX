'use client';

import React from 'react';
import { SeverityLevel } from './StatusBadge';

interface ScoreRingProps {
  value: number; // 0 to 100
  severity: SeverityLevel;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const RING_COLOR: Record<SeverityLevel, string> = {
  immediate: '#EF4444',
  'short-term': '#F59E0B',
  'medium-term': '#CA8A04',
  safe: '#10B981',
};

export default function ScoreRing({
  value,
  severity,
  size = 44,
  strokeWidth = 4,
  className = '',
}: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = RING_COLOR[severity] || RING_COLOR.safe;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Risk score ${clamped} of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-sans font-extrabold tabular-nums text-gray-900"
        style={{ fontSize: size * 0.32 }}
      >
        {clamped}
      </div>
    </div>
  );
}
