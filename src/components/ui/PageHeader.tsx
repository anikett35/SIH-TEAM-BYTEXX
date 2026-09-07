'use client';

import React from 'react';
import { MapPin } from 'lucide-react';


interface PageHeaderProps {
  title: string;
  description: string;
  zone?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  zone,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3.5 shrink-0 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-bold text-base sm:text-lg text-gray-900 tracking-tight uppercase leading-snug">
              {title}
            </h1>
            {badge}
          </div>
          <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
            <span>{description}</span>
            {zone && (
              <div className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-gray-500 font-normal">Zone:</span>
                <span className="font-semibold text-gray-900">{zone}</span>
              </div>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
