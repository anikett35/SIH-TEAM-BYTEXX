'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDisaster } from '@/context/DisasterContext';
import { DISASTER_REGIONS } from '@/data/regions';
import {
  ShieldAlert,
  MapPin,
  SlidersHorizontal,
  Megaphone,
  Map,
  TableProperties,
  Building2,
  FileCheck2,
  FlaskConical,
  BellRing,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import ScenarioSimulator from '@/components/ScenarioSimulator';
import EmergencyAlertModal from '@/components/EmergencyAlertModal';

export default function Navbar() {
  const pathname = usePathname();
  const {
    currentRegion,
    setCurrentRegion,
    simulationParams,
    setSimulationParams,
    resetSimulation,
    isSimulationModified,
    processedHabitations,
  } = useDisaster();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Evacuation Map', icon: <Map className="w-4 h-4" /> },
    { href: '/risk-matrix', label: 'Village Risk Matrix', icon: <TableProperties className="w-4 h-4" /> },
    { href: '/shelters', label: 'Safe Shelters', icon: <Building2 className="w-4 h-4" /> },
    { href: '/evacuation-plans', label: 'Evacuation Plans', icon: <FileCheck2 className="w-4 h-4" /> },
    { href: '/simulation', label: 'Disaster Simulator', icon: <FlaskConical className="w-4 h-4" /> },
    { href: '/alerts', label: 'Alert Center', icon: <BellRing className="w-4 h-4" /> },
    { href: '/about', label: 'How It Works', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 text-gray-900 shadow-xs font-sans">
        {/* Main Command Bar */}
        <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center bg-gray-900 border border-gray-200 shadow-xs">
              <img src="/logo.webp" alt="ByteX DSS Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-sans font-bold text-base tracking-tight text-gray-900 leading-none">
                ByteX <span className="text-primary font-extrabold">DSS</span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5 hidden sm:block">
                Emergency Evacuation & Relocation DSS
              </p>
            </div>
          </Link>

          {/* Testbed Switcher & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Region Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200 text-xs text-gray-900">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-gray-500 font-medium hidden md:inline">Zone:</span>
              <select
                value={currentRegion.id}
                onChange={(e) => {
                  const found = DISASTER_REGIONS.find((r) => r.id === e.target.value);
                  if (found) setCurrentRegion(found);
                }}
                aria-label="Select disaster zone"
                className="bg-transparent text-gray-900 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {DISASTER_REGIONS.map((reg) => (
                  <option key={reg.id} value={reg.id} className="bg-white text-gray-900">
                    {reg.name} ({reg.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Stress Simulator Toggle */}
            <button
              type="button"
              onClick={() => setIsSimulatorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 transition-colors shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">{isSimulationModified ? 'Active Simulation' : 'Simulator'}</span>
              {isSimulationModified && (
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              )}
            </button>

            {/* High-visibility Emergency Broadcast Button */}
            <button
              type="button"
              onClick={() => setIsAlertOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-error hover:bg-red-600 active:bg-red-700 text-white shadow-xs transition-all"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Broadcast Alert</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-xl text-gray-600 hover:bg-gray-100 lg:hidden border border-gray-200"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Global Navigation Links Row */}
        <nav className="hidden lg:flex items-center px-4 sm:px-6 lg:px-8 text-xs font-medium overflow-x-auto border-t border-gray-100 bg-white font-sans">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 py-2.5 px-3.5 border-b-2 transition-all shrink-0 text-xs font-semibold ${
                  isActive
                    ? 'border-primary text-primary bg-primary-subtle/20'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className={isActive ? 'text-primary' : 'text-gray-400'}>
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden p-3 bg-white border-t border-gray-200 space-y-1 font-sans">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-subtle/30 text-primary font-bold border-l-2 border-primary'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className={isActive ? 'text-primary' : 'text-gray-400'}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Global Scenario Sandbox Modal */}
      <ScenarioSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        params={simulationParams}
        onChangeParams={setSimulationParams}
        onReset={resetSimulation}
      />

      {/* Global CAP Emergency Broadcast Modal */}
      <EmergencyAlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        targetHabitations={processedHabitations.filter(
          (h) => h.calculatedRisk.priority === 'Immediate'
        )}
      />
    </>
  );
}
