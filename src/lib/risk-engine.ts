import { Habitation, PriorityLevel, SimulationParams } from '@/types/disaster';

/**
 * ByteX Multi-Hazard Risk & Vulnerability Assessment Engine
 * Adheres to NDMA Guidelines and national multi-hazard relocation standards.
 * 
 * Formula:
 * Overall Risk Score = (0.40 * HazardFactor) + 
 *                      (0.25 * PhysicalVulnerability) + 
 *                      (0.20 * DemographicExposure) + 
 *                      (0.15 * IsolationDeficit)
 */
export function calculateHabitationRisk(
  habitation: Habitation,
  simulation: SimulationParams
): Habitation['calculatedRisk'] {
  // 1. Hazard Factor Adjustment based on Simulation parameters
  const rainMultiplier = 1 + simulation.rainfallAnomalyPercent / 100;
  const floodBonus = Math.min(40, simulation.riverLevelRiseMeters * 8);

  const dynamicFlood = Math.min(100, (habitation.hazardExposure.floodIndex * rainMultiplier) + floodBonus);
  const dynamicLandslide = Math.min(
    100,
    habitation.hazardExposure.landslideSusceptibility * (1 + (simulation.rainfallAnomalyPercent > 20 ? 0.35 : 0))
  );
  const dynamicCloudburst = simulation.cloudburstZoneActive
    ? Math.min(100, habitation.hazardExposure.cloudburstRisk * 1.5)
    : habitation.hazardExposure.cloudburstRisk;
  const dynamicErosion = habitation.hazardExposure.erosionProne;

  // Composite Hazard Factor (0 - 100)
  const hazardFactor = Math.min(
    100,
    (0.35 * dynamicFlood) + 
    (0.35 * dynamicLandslide) + 
    (0.20 * dynamicCloudburst) + 
    (0.10 * dynamicErosion)
  );

  // 2. Physical & Infrastructure Vulnerability (0 - 100)
  const kutchaScore = habitation.infrastructure.kutchaHousesPercent;
  const healthDistScore = Math.min(100, habitation.infrastructure.primaryHealthCenterDistanceKm * 8);
  const physicalVulnerability = (0.6 * kutchaScore) + (0.4 * healthDistScore);

  // 3. Demographic Exposure (0 - 100)
  const totalVulnerable =
    habitation.vulnerableGroups.children +
    habitation.vulnerableGroups.elderly +
    habitation.vulnerableGroups.differentlyAbled;
  const vulnerableRatio = habitation.population > 0 ? (totalVulnerable / habitation.population) : 0.2;
  const populationDensityFactor = Math.min(100, (habitation.population / 400) * 50);
  const demographicExposure = (0.6 * (vulnerableRatio * 100)) + (0.4 * populationDensityFactor);

  // 4. Isolation & Coping Deficit (0 - 100)
  let roadDeficit = 20;
  if (habitation.infrastructure.roadConnectivity === 'footpath_only') roadDeficit = 85;
  else if (habitation.infrastructure.roadConnectivity === 'bridge_dependent') roadDeficit = 70;
  else if (habitation.infrastructure.roadConnectivity === 'single_lane_kutcha') roadDeficit = 45;

  let bridgeDeficit = 10;
  if (
    simulation.simulateBridgeCollapse ||
    habitation.infrastructure.bridgeAccessStatus === 'submerged_cutoff'
  ) {
    bridgeDeficit = 95;
  } else if (habitation.infrastructure.bridgeAccessStatus === 'threatened') {
    bridgeDeficit = 65;
  }

  const isolationDeficit = (0.5 * roadDeficit) + (0.5 * bridgeDeficit);

  // Weighted Total Score (0 - 100)
  let overallScore = Math.round(
    (0.40 * hazardFactor) +
    (0.25 * physicalVulnerability) +
    (0.20 * demographicExposure) +
    (0.15 * isolationDeficit)
  );
  overallScore = Math.max(5, Math.min(99, overallScore));

  // Determine Categorization & Primary Threat Reason
  let priority: PriorityLevel = 'Low';
  let primaryThreatReason = 'Stable terrain buffer with low active hazard saturation.';

  if (overallScore >= 75 || bridgeDeficit >= 90 || dynamicFlood >= 85 || dynamicLandslide >= 85) {
    priority = 'Immediate';
    if (bridgeDeficit >= 90) {
      primaryThreatReason = 'Critical access cut-off imminent / bridge submerged with high flood crest.';
    } else if (dynamicLandslide >= 85) {
      primaryThreatReason = 'Severe slope failure & debris flow triggering threshold crossed.';
    } else if (dynamicFlood >= 85) {
      primaryThreatReason = 'Extreme river inundation exceeding 50-year return period boundary.';
    } else {
      primaryThreatReason = 'Multi-hazard convergence compounded by demographic vulnerability.';
    }
  } else if (overallScore >= 50) {
    priority = 'Short-Term';
    primaryThreatReason = 'High hazard exposure with delayed evacuation window (24-48 hrs).';
  } else if (overallScore >= 30) {
    priority = 'Medium-Term';
    primaryThreatReason = 'Moderate slope instability or seasonal waterlogging requiring planned mitigation.';
  }

  return {
    overallScore,
    priority,
    hazardFactor: Math.round(hazardFactor),
    vulnerabilityFactor: Math.round(physicalVulnerability),
    exposureFactor: Math.round(demographicExposure),
    copingDeficitFactor: Math.round(isolationDeficit),
    primaryThreatReason,
  };
}
