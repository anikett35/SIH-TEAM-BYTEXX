'use client';

import React, { useState } from 'react';
import { useDisaster } from '@/context/DisasterContext';
import { DISASTER_REGIONS } from '@/data/regions';
import {
  MapPin,
  ChevronDown,
  Check,
  Megaphone,
  Bell,
  ShieldCheck,
  Search,
} from 'lucide-react';
import EmergencyAlertModal from '@/components/EmergencyAlertModal';

interface TopHeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function TopHeader({ onMobileMenuToggle }: TopHeaderProps) {
  const { currentRegion, setCurrentRegion, processedHabitations } = useDisaster();
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const immediateCount = processedHabitations.filter(
    (h) => h.calculatedRisk.priority === 'Immediate'
  ).length;

  return (
    <>
      <header className="h-16 bg-[#091b2a] border-b border-cyan-900/60 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 font-sans">
        {/* Left: Operational Zone Dropdown & Quick Indicator */}
        <div className="flex items-center gap-3">
          {/* Zone Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsZoneOpen(!isZoneOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#102a40] hover:bg-[#163452] border border-cyan-900/60 text-xs font-semibold text-slate-200 transition-colors shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{currentRegion.name}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                  isZoneOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isZoneOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1 space-y-0.5">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Disaster Zone
                </div>
                {DISASTER_REGIONS.map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => {
                      setCurrentRegion(reg);
                      setIsZoneOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                      currentRegion.id === reg.id
                        ? 'bg-primary-subtle text-primary font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div>
                      <div className="truncate">{reg.name}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{reg.state}</div>
                    </div>
                    {currentRegion.id === reg.id && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right: Quick Actions & Status */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAlertModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 text-rose-200 text-xs font-bold shadow-[0_0_14px_rgba(255,51,79,.18)] button-press-feedback transition-colors"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Broadcast Alert</span>
            {immediateCount > 0 && (
              <span className="px-1.5 py-0.2 bg-white text-error rounded-full text-[10px] font-black">
                {immediateCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-cyan-900/60 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00d084]" />
            <span className="font-medium text-slate-300">DEOC Operational</span>
          </div>
        </div>
      </header>

      {/* Global Alert Modal */}
      <EmergencyAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        targetHabitations={processedHabitations.filter(
          (h) => h.calculatedRisk.priority === 'Immediate'
        )}
      />
    </>
  );
}
