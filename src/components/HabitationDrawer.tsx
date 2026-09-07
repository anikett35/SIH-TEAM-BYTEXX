'use client';

import React from 'react';
import Link from 'next/link';
import { Habitation } from '@/types/disaster';
import { X, MapPin, Bus, Building2, FileCheck2, Route, AlertTriangle, ShieldCheck } from 'lucide-react';
import { WhatsAppLogo } from '@/components/icons/BrandLogos';

interface HabitationDrawerProps {
  habitation: Habitation | null;
  onClose: () => void;
  onFocusMap?: () => void;
  variant?: 'card' | 'plain';
}

export default function HabitationDrawer({
  habitation,
  onClose,
  onFocusMap,
  variant = 'card',
}: HabitationDrawerProps) {
  if (!habitation) return null;

  const score = habitation.calculatedRisk.overallScore;
  const isImmediate = habitation.calculatedRisk.priority === 'Immediate';
  const isShortTerm = habitation.calculatedRisk.priority === 'Short-Term';


  return (
    <div
      className={
        variant === 'card'
          ? 'p-5 bg-white border border-gray-200 rounded-2xl shadow-raised text-gray-900 space-y-4 font-sans max-w-sm w-full'
          : 'space-y-4 text-gray-900 font-sans p-2'
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-gray-200 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                isImmediate
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : isShortTerm
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {habitation.calculatedRisk.priority} Priority
            </span>
            <span className="text-[11px] text-gray-400 font-sans">ID: {habitation.id}</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mt-1.5 uppercase tracking-tight truncate">
            {habitation.name}
          </h3>
          <div className="text-xs text-gray-500 font-medium mt-0.5">
            {habitation.district} &bull; {habitation.elevationMeters}m elevation
          </div>
        </div>

        {variant === 'card' && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Primary Operational Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
          <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Risk Score</div>
          <div className="font-sans font-extrabold text-base mt-0.5 text-gray-900">
            {score}<span className="text-[10px] font-normal text-gray-400">/100</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
          <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Population</div>
          <div className="font-sans font-bold text-base mt-0.5 text-gray-900">
            {habitation.population.toLocaleString()}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
          <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Fleet Req</div>
          <div className="font-sans font-bold text-base mt-0.5 text-primary">
            {habitation.relocationAssignment?.assignedBuses || 0}{' '}
            <span className="text-[10px] font-normal text-gray-500">buses</span>
          </div>
        </div>
      </div>

      {/* Hazard Threat Summary */}
      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1 text-xs">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
          <span>Primary Hazard Threat</span>
        </div>
        <p className="text-xs text-gray-800 leading-relaxed font-medium">
          {habitation.calculatedRisk.primaryThreatReason}
        </p>
      </div>

      {/* Relocation Shelter Destination */}
      {habitation.relocationAssignment ? (
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
            <span>Designated Safe Shelter</span>
            <span
              className={`font-semibold capitalize ${
                habitation.relocationAssignment.evacuationRouteStatus === 'blocked'
                  ? 'text-error'
                  : 'text-success'
              }`}
            >
              Route {habitation.relocationAssignment.evacuationRouteStatus}
            </span>
          </div>

          <div>
            <div className="font-bold text-gray-900 text-xs">
              {habitation.relocationAssignment.safeSiteName}
            </div>
            <div className="text-[11px] text-gray-500 font-sans mt-0.5 flex items-center gap-2">
              <span>{habitation.relocationAssignment.distanceKm} km</span>
              <span>&bull;</span>
              <span>{habitation.relocationAssignment.travelTimeMinutes} min ETA</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 text-center">
          No active relocation assignment.
        </div>
      )}

      {/* Action Buttons & WhatsApp Link */}
      <div className="pt-2 border-t border-gray-200 space-y-2 text-xs">
        {/* Real WhatsApp Contact Action */}
        <button
          type="button"
          onClick={() => {
            const msg = encodeURIComponent(
              `🚨 EMERGENCY COORDINATION [ByteX DSS]\nSettlement: ${habitation.name} (${habitation.district})\nRisk Score: ${score}/100 [${habitation.calculatedRisk.priority} Priority]\nPopulation: ${habitation.population.toLocaleString()}\nDesignated Safe Shelter: ${habitation.relocationAssignment?.safeSiteName || 'Pending'}\nPlease ensure village evacuation readiness immediately.`
            );
            window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 font-bold transition-colors text-xs"
        >
          <WhatsAppLogo className="w-4 h-4" />
          <span>Alert Village Nodal Officer on WhatsApp</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          {onFocusMap ? (
            <button
              type="button"
              onClick={onFocusMap}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-semibold transition-colors"
            >
              <Route className="w-3.5 h-3.5 text-primary" />
              <span>View Route</span>
            </button>
          ) : (
            <Link
              href="/evacuation-plans"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-semibold transition-colors"
            >
              <Route className="w-3.5 h-3.5 text-primary" />
              <span>View Route</span>
            </Link>
          )}

          <Link
            href="/evacuation-plans"
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary hover:bg-primary-deep text-white font-semibold transition-colors shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Relocation Plan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
