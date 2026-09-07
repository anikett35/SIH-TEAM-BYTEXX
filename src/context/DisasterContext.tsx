'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  DisasterRegion,
  Habitation,
  HazardPolygon,
  SafeSite,
  SimulationParams,
} from '@/types/disaster';
import { DISASTER_REGIONS } from '@/data/regions';
import { calculateHabitationRisk } from '@/lib/risk-engine';
import { optimizeRelocationAssignments } from '@/lib/capacity-engine';

export const DEFAULT_SIMULATION: SimulationParams = {
  rainfallAnomalyPercent: 0,
  riverLevelRiseMeters: 0,
  simulateBridgeCollapse: false,
  shelterCapacityFactor: 1.0,
  cloudburstZoneActive: false,
};

interface DisasterContextType {
  currentRegion: DisasterRegion;
  setCurrentRegion: (region: DisasterRegion) => void;
  simulationParams: SimulationParams;
  setSimulationParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  resetSimulation: () => void;
  processedHabitations: Habitation[];
  processedSafeSites: SafeSite[];
  isSimulationModified: boolean;
  selectedHabitation: Habitation | null;
  setSelectedHabitation: (hab: Habitation | null) => void;
  selectedSafeSite: SafeSite | null;
  setSelectedSafeSite: (site: SafeSite | null) => void;
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

export function DisasterProvider({ children }: { children: ReactNode }) {
  const [currentRegion, setCurrentRegion] = useState<DisasterRegion>(DISASTER_REGIONS[0]);
  const [simulationParams, setSimulationParams] = useState<SimulationParams>(DEFAULT_SIMULATION);
  const [selectedHabitation, setSelectedHabitation] = useState<Habitation | null>(null);
  const [selectedSafeSite, setSelectedSafeSite] = useState<SafeSite | null>(null);

  const resetSimulation = () => setSimulationParams(DEFAULT_SIMULATION);

  const { processedHabitations, processedSafeSites } = useMemo(() => {
    const evaluatedHabitations = currentRegion.habitations.map((hab) => ({
      ...hab,
      calculatedRisk: calculateHabitationRisk(hab, simulationParams),
    }));

    const { updatedHabitations, updatedSafeSites } = optimizeRelocationAssignments(
      evaluatedHabitations,
      currentRegion.safeSites,
      simulationParams
    );

    return {
      processedHabitations: updatedHabitations,
      processedSafeSites: updatedSafeSites,
    };
  }, [currentRegion, simulationParams]);

  const isSimulationModified =
    simulationParams.rainfallAnomalyPercent !== 0 ||
    simulationParams.riverLevelRiseMeters !== 0 ||
    simulationParams.simulateBridgeCollapse ||
    simulationParams.shelterCapacityFactor !== 1.0 ||
    simulationParams.cloudburstZoneActive;

  return (
    <DisasterContext.Provider
      value={{
        currentRegion,
        setCurrentRegion: (reg) => {
          setCurrentRegion(reg);
          setSelectedHabitation(null);
          setSelectedSafeSite(null);
        },
        simulationParams,
        setSimulationParams,
        resetSimulation,
        processedHabitations,
        processedSafeSites,
        isSimulationModified,
        selectedHabitation,
        setSelectedHabitation,
        selectedSafeSite,
        setSelectedSafeSite,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
}

export function useDisaster() {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisaster must be used within a DisasterProvider');
  }
  return context;
}
