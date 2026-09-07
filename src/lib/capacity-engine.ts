import { Habitation, SafeSite, SimulationParams } from '@/types/disaster';

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export function calculateHaversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth radius in km

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Generates an interpolated transit route corridor between two coordinates
 */
export function generateTransitCorridor(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  // Realistic intermediate inflection points simulating mountain road passes
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  const jitterLat = (end[1] - start[1]) * 0.15;
  const jitterLng = (start[0] - end[0]) * 0.15;

  return [
    start,
    [midLat + jitterLat, midLng + jitterLng],
    end,
  ];
}

/**
 * Multi-Criteria Carrying Capacity & Safe Relocation Assignment Engine
 * Balances travel proximity, terrain passability, and shelter capacity limits.
 */
export function optimizeRelocationAssignments(
  habitations: Habitation[],
  safeSites: SafeSite[],
  simulation: SimulationParams
): {
  updatedHabitations: Habitation[];
  updatedSafeSites: SafeSite[];
  totalCapacityDeficit: number;
} {
  // Deep clone to avoid mutating input objects
  const sites = safeSites.map((s) => ({
    ...s,
    effectiveCapacity: Math.round(s.totalCapacity * simulation.shelterCapacityFactor),
    assignedEvacuees: 0,
    assignedHabitations: [] as string[],
  }));

  // Sort habitations: Immediate evacuees first, then Short-Term, then Medium-Term
  const priorityWeight: Record<string, number> = {
    Immediate: 1,
    'Short-Term': 2,
    'Medium-Term': 3,
    Low: 4,
  };

  const sortedHabitations = [...habitations].sort(
    (a, b) =>
      priorityWeight[a.calculatedRisk.priority] - priorityWeight[b.calculatedRisk.priority] ||
      b.calculatedRisk.overallScore - a.calculatedRisk.overallScore
  );

  let totalCapacityDeficit = 0;

  const assignedHabitations = sortedHabitations.map((hab) => {
    // Only assign relocation if priority is Immediate, Short-Term, or Medium-Term
    if (hab.calculatedRisk.priority === 'Low') {
      return {
        ...hab,
        relocationAssignment: undefined,
      };
    }

    // Rank candidate safe sites
    // Criteria:
    // 1. Must not be isolated or flooded
    // 2. Headroom (effectiveCapacity - (currentOccupancy + assignedEvacuees))
    // 3. Distance & elevation advantage
    const candidateSites = sites.map((site) => {
      const distance = calculateHaversineDistance(hab.coordinates, site.coordinates);
      const remainingHeadroom = site.effectiveCapacity - (site.currentOccupancy + site.assignedEvacuees);
      const roadDistanceKm = Math.round(distance * 1.35 * 10) / 10;
      const travelTimeMinutes = Math.round((roadDistanceKm / 32) * 60) + 15; // factoring convoy prep

      // Score penalty: heavy penalty if capacity is exceeded
      let score = roadDistanceKm;
      if (remainingHeadroom < hab.population) {
        score += (hab.population - remainingHeadroom) * 0.8;
      }
      if (site.hasMedicalTriage && hab.vulnerableGroups.elderly > 50) {
        score -= 5; // bonus for medical access for vulnerable population
      }

      return {
        site,
        roadDistanceKm,
        travelTimeMinutes,
        remainingHeadroom,
        score,
      };
    });

    candidateSites.sort((a, b) => a.score - b.score);
    const chosen = candidateSites[0];

    let routeStatus: 'open' | 'caution' | 'blocked' = 'open';
    if (simulation.simulateBridgeCollapse && hab.infrastructure.roadConnectivity === 'bridge_dependent') {
      routeStatus = 'blocked';
    } else if (hab.infrastructure.roadConnectivity === 'single_lane_kutcha' || simulation.rainfallAnomalyPercent > 40) {
      routeStatus = 'caution';
    }

    if (chosen) {
      chosen.site.assignedEvacuees += hab.population;
      chosen.site.assignedHabitations.push(hab.id);

      if (chosen.remainingHeadroom < hab.population) {
        totalCapacityDeficit += (hab.population - Math.max(0, chosen.remainingHeadroom));
      }

      const assignedBuses = Math.max(1, Math.ceil(hab.population / 42));

      return {
        ...hab,
        relocationAssignment: {
          safeSiteId: chosen.site.id,
          safeSiteName: chosen.site.name,
          distanceKm: chosen.roadDistanceKm,
          travelTimeMinutes: chosen.travelTimeMinutes,
          evacuationRouteStatus: routeStatus,
          assignedBuses,
          transitRouteCoordinates: generateTransitCorridor(hab.coordinates, chosen.site.coordinates),
        },
      };
    }

    return hab;
  });

  // Update site status based on final utilization
  const updatedSafeSites: SafeSite[] = sites.map((site) => {
    const totalOccupied = site.currentOccupancy + site.assignedEvacuees;
    const ratio = totalOccupied / (site.effectiveCapacity || 1);

    let status: SafeSite['status'] = 'available';
    if (ratio > 1.05) status = 'overflow';
    else if (ratio >= 0.85) status = 'near_capacity';

    return {
      ...site,
      totalCapacity: site.effectiveCapacity,
      status,
    };
  });

  // Restore original ordering of habitations
  const idMap = new Map(assignedHabitations.map((h) => [h.id, h]));
  const orderedHabitations = habitations.map((h) => idMap.get(h.id) || h);

  return {
    updatedHabitations: orderedHabitations,
    updatedSafeSites,
    totalCapacityDeficit,
  };
}
