'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MapContainer from '@/components/map/MapContainer';
import GISTopToolbar from '@/components/GISTopToolbar';
import HabitationDrawer from '@/components/HabitationDrawer';
import HabitationList from '@/components/HabitationList';
import BottomSheet from '@/components/ui/BottomSheet';
import EmergencyAlertModal from '@/components/EmergencyAlertModal';
import AdaptiveCard from '@/components/shared/AdaptiveCard';
import { useDisaster } from '@/context/DisasterContext';
import { HazardType, PriorityLevel } from '@/types/disaster';
import { ArrowRight, MapPin, Bus } from 'lucide-react';

export default function GISOperationsPage() {
  const {
    currentRegion,
    processedHabitations,
    processedSafeSites,
    selectedHabitation,
    setSelectedHabitation,
    selectedSafeSite,
    setSelectedSafeSite,
  } = useDisaster();

  // Layer & Filter States
  const [activeHazards, setActiveHazards] = useState<Record<HazardType, boolean>>({
    flood: true,
    landslide: true,
    cloudburst: true,
    erosion: true,
  });

  const [activePriorityFilters, setActivePriorityFilters] = useState<
    Record<PriorityLevel, boolean>
  >({
    Immediate: true,
    'Short-Term': true,
    'Medium-Term': true,
    Low: true,
  });

  const [showEvacuationRoutes, setShowEvacuationRoutes] = useState<boolean>(true);
  const [showShelters, setShowShelters] = useState<boolean>(true);
  const [showRoadConstraints, setShowRoadConstraints] = useState<boolean>(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Operational metrics
  const immediateHabs = processedHabitations.filter(
    (h) => h.calculatedRisk.priority === 'Immediate'
  );
  const shortTermHabs = processedHabitations.filter(
    (h) => h.calculatedRisk.priority === 'Short-Term'
  );
  const immediatePop = immediateHabs.reduce((acc, h) => acc + h.population, 0);
  const monitoredPop = processedHabitations
    .filter((h) => h.calculatedRisk.priority !== 'Low')
    .reduce((acc, h) => acc + h.population, 0);

  const requiredFleet = immediateHabs.reduce(
    (acc, h) => acc + (h.relocationAssignment?.assignedBuses || 0),
    0
  );

  const totalCapacity = processedSafeSites.reduce((acc, s) => acc + s.totalCapacity, 0);
  const totalOccupiedAndAssigned = processedSafeSites.reduce(
    (acc, s) => acc + s.currentOccupancy + s.assignedEvacuees,
    0
  );
  const headroom = Math.max(0, totalCapacity - totalOccupiedAndAssigned);

  const handleResetFilters = () => {
    setActiveHazards({
      flood: true,
      landslide: true,
      cloudburst: true,
      erosion: true,
    });
    setActivePriorityFilters({
      Immediate: true,
      'Short-Term': true,
      'Medium-Term': true,
      Low: true,
    });
    setShowEvacuationRoutes(true);
    setShowShelters(true);
    setShowRoadConstraints(true);
    setSelectedHabitation(null);
    setSelectedSafeSite(null);
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 font-sans">
      {/* 1. OPERATIONAL OVERVIEW 4 METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Critical Red-Zone */}
        <div className="card card-border p-5 bg-white shadow-xs space-y-1.5">
          <div className="text-xs font-semibold text-gray-500">Critical Red-Zone</div>
          <div className="text-2xl sm:text-3xl font-bold text-error tracking-tight">
            {immediatePop.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            {immediateHabs.length} settlements
          </div>
        </div>

        {/* Card 2: Transit Fleet Staged */}
        <div className="card card-border p-5 bg-white shadow-xs space-y-1.5">
          <div className="text-xs font-semibold text-gray-500">Transit Fleet Staged</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {requiredFleet}
          </div>
          <div className="text-xs text-gray-400">
            Buses ready for transit
          </div>
        </div>

        {/* Card 3: Shelter Headroom */}
        <div className="card card-border p-5 bg-white shadow-xs space-y-1.5">
          <div className="text-xs font-semibold text-gray-500">Shelter Headroom</div>
          <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${headroom > 0 ? 'text-emerald-600' : 'text-error'}`}>
            {headroom > 0 ? `+${headroom.toLocaleString()}` : headroom.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            {processedSafeSites.length} verified shelters
          </div>
        </div>

        {/* Card 4: Secondary Watch */}
        <div className="card card-border p-5 bg-white shadow-xs space-y-1.5">
          <div className="text-xs font-semibold text-gray-500">Secondary Watch</div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 tracking-tight">
            {monitoredPop.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            {shortTermHabs.length} settlements staged
          </div>
        </div>
      </div>

      {/* 2. GIS MAP CONSOLE (AdaptiveCard) */}
      <AdaptiveCard className="overflow-hidden">
        {/* Spatial Controls Toolbar */}
        <GISTopToolbar
          activeHazards={activeHazards}
          onToggleHazard={(type) =>
            setActiveHazards((prev) => ({ ...prev, [type]: !prev[type] }))
          }
          activePriorityFilters={activePriorityFilters}
          onTogglePriority={(priority) =>
            setActivePriorityFilters((prev) => ({
              ...prev,
              [priority]: !prev[priority],
            }))
          }
          showEvacuationRoutes={showEvacuationRoutes}
          onToggleEvacuationRoutes={() => setShowEvacuationRoutes(!showEvacuationRoutes)}
          showShelters={showShelters}
          onToggleShelters={() => setShowShelters(!showShelters)}
          showRoadConstraints={showRoadConstraints}
          onToggleRoadConstraints={() => setShowRoadConstraints(!showRoadConstraints)}
          habitations={processedHabitations}
          onResetFilters={handleResetFilters}
        />

        {/* Full Map Canvas */}
        <div className="relative w-full h-[540px] lg:h-[620px] bg-gray-100 flex flex-col overflow-hidden">
          <MapContainer
            region={currentRegion}
            habitations={processedHabitations}
            safeSites={processedSafeSites}
            hazardPolygons={currentRegion.hazardPolygons}
            selectedHabitation={selectedHabitation}
            selectedSafeSite={selectedSafeSite}
            onSelectHabitation={(hab) => {
              setSelectedHabitation(hab);
              if (hab) setSelectedSafeSite(null);
            }}
            onSelectSafeSite={(site) => {
              setSelectedSafeSite(site);
              if (site) setSelectedHabitation(null);
            }}
            activeHazards={activeHazards}
            activePriorityFilters={activePriorityFilters}
            showEvacuationRoutes={showEvacuationRoutes}
            showShelters={showShelters}
            showRoadConstraints={showRoadConstraints}
          />

          {/* Desktop Settlement Inspector (Docked Inside Map) */}
          {selectedHabitation && (
            <div className="hidden lg:block absolute top-3 right-3 z-[500] max-h-[calc(100%-24px)] overflow-y-auto">
              <HabitationDrawer
                habitation={selectedHabitation}
                onClose={() => setSelectedHabitation(null)}
              />
            </div>
          )}
        </div>
      </AdaptiveCard>

      {/* 3. AFFECTED SETTLEMENTS QUEUE */}
      <HabitationList
        habitations={processedHabitations}
        selectedHabitation={selectedHabitation}
        onSelectHabitation={(hab) => {
          setSelectedHabitation(hab);
          if (hab) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        activePriorityFilters={activePriorityFilters}
      />

      {/* Mobile Selected Settlement Inspector */}
      <BottomSheet
        isOpen={!!selectedHabitation}
        onClose={() => setSelectedHabitation(null)}
        title="Settlement Command Inspector"
      >
        {selectedHabitation && (
          <HabitationDrawer
            habitation={selectedHabitation}
            onClose={() => setSelectedHabitation(null)}
            variant="plain"
          />
        )}
      </BottomSheet>

      {/* Emergency Alert Modal */}
      <EmergencyAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        targetHabitations={immediateHabs}
      />
    </div>
  );
}
