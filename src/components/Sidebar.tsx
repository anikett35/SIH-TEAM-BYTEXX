'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDisaster } from '@/context/DisasterContext';
import {
  Map,
  TableProperties,
  Building2,
  FileCheck2,
  FlaskConical,
  BellRing,
  BookOpen,
  SlidersHorizontal,
  Menu,
  X,
} from 'lucide-react';
import ScenarioSimulator from '@/components/ScenarioSimulator';

export default function Sidebar() {
  const pathname = usePathname();
  const {
    simulationParams,
    setSimulationParams,
    resetSimulation,
    isSimulationModified,
  } = useDisaster();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const operationsLinks = [
    { href: '/', label: 'Evacuation Map', icon: <Map className="w-4 h-4" /> },
    { href: '/risk-matrix', label: 'Village Risk Matrix', icon: <TableProperties className="w-4 h-4" /> },
    { href: '/shelters', label: 'Safe Shelters', icon: <Building2 className="w-4 h-4" /> },
    { href: '/evacuation-plans', label: 'Evacuation Plans', icon: <FileCheck2 className="w-4 h-4" /> },
  ];

  const analyticsLinks = [
    { href: '/simulation', label: 'Disaster Simulator', icon: <FlaskConical className="w-4 h-4" /> },
    { href: '/alerts', label: 'Alert Center', icon: <BellRing className="w-4 h-4" /> },
    { href: '/about', label: 'How It Works', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-40 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
            <img src="/logo.webp" alt="ByteX DSS Logo" className="w-full h-full object-cover" />
          </div>
          <div className="font-sans font-bold text-base text-gray-900">
            ByteX <span className="text-primary font-extrabold">DSS</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 border border-gray-200"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Left Sidebar & Mobile Drawer */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 h-full bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 font-sans ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Brand Header */}
        <div className="h-16 px-5 flex items-center border-b border-gray-100 shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
              <img src="/logo.webp" alt="ByteX DSS Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-sans font-bold text-base tracking-tight text-gray-900 leading-none">
                ByteX <span className="text-primary font-extrabold">DSS</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium mt-1">
                Disaster Decision Support
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Clean Grouped Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Operations Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Operations
            </div>
            {operationsLinks.map((link) => {
              const normalizedPath = (pathname || '').replace(/\/$/, '') || '/';
              const normalizedLink = link.href.replace(/\/$/, '') || '/';
              const isActive = normalizedPath === normalizedLink || (normalizedLink !== '/' && normalizedPath.startsWith(normalizedLink));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Analytics & Tools Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Analytics &amp; Alerts
            </div>
            {analyticsLinks.map((link) => {
              const normalizedPath = (pathname || '').replace(/\/$/, '') || '/';
              const normalizedLink = link.href.replace(/\/$/, '') || '/';
              const isActive = normalizedPath === normalizedLink || (normalizedLink !== '/' && normalizedPath.startsWith(normalizedLink));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Sandbox Action */}
          <div className="pt-2 px-1">
            <button
              type="button"
              onClick={() => {
                setIsSimulatorOpen(true);
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                <span>Stress Simulator</span>
              </div>
              {isSimulationModified ? (
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              ) : (
                <span className="text-[10px] font-normal text-gray-400">Sandbox</span>
              )}
            </button>
          </div>
        </nav>

        {/* Bottom: Minimal Status */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span className="flex items-center gap-2 font-medium text-gray-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>DEOC Active</span>
          </span>
          <span className="text-[10px] font-mono text-gray-400">v2.4</span>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      {/* Global Scenario Sandbox Modal */}
      <ScenarioSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        params={simulationParams}
        onChangeParams={setSimulationParams}
        onReset={resetSimulation}
      />
    </>
  );
}
