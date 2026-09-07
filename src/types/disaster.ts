export type HazardType = 'flood' | 'landslide' | 'cloudburst' | 'erosion';

export type PriorityLevel = 'Immediate' | 'Short-Term' | 'Medium-Term' | 'Low';

export interface HazardPolygon {
  id: string;
  type: HazardType;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  name: string;
  description: string;
  coordinates: [number, number][]; // LatLng polygon coordinates
  bufferRadiusMeters?: number;
  intensityIndex: number; // 0 - 100
}

export interface Habitation {
  id: string;
  name: string;
  localName?: string;
  district: string;
  coordinates: [number, number]; // [lat, lng]
  elevationMeters: number;
  slopeDegrees: number;
  distanceToRiverMeters: number;
  population: number;
  households: number;
  vulnerableGroups: {
    children: number;
    elderly: number;
    differentlyAbled: number;
  };
  infrastructure: {
    kutchaHousesPercent: number;
    primaryHealthCenterDistanceKm: number;
    roadConnectivity: 'all_weather' | 'single_lane_kutcha' | 'footpath_only' | 'bridge_dependent';
    bridgeAccessStatus: 'safe' | 'threatened' | 'submerged_cutoff';
  };
  hazardExposure: {
    floodIndex: number; // 0 - 100
    landslideSusceptibility: number; // 0 - 100
    cloudburstRisk: number; // 0 - 100
    erosionProne: number; // 0 - 100
  };
  calculatedRisk: {
    overallScore: number; // 0 - 100
    priority: PriorityLevel;
    hazardFactor: number;
    vulnerabilityFactor: number;
    exposureFactor: number;
    copingDeficitFactor: number;
    primaryThreatReason: string;
  };
  relocationAssignment?: {
    safeSiteId: string;
    safeSiteName: string;
    distanceKm: number;
    travelTimeMinutes: number;
    evacuationRouteStatus: 'open' | 'caution' | 'blocked';
    assignedBuses: number;
    transitRouteCoordinates: [number, number][];
  };
}

export interface SafeSite {
  id: string;
  name: string;
  type: 'school' | 'community_hall' | 'sports_complex' | 'temporary_shelter' | 'military_transit';
  district: string;
  coordinates: [number, number];
  elevationMeters: number;
  totalCapacity: number;
  currentOccupancy: number;
  assignedEvacuees: number;
  waterSupplyLitersPerDay: number;
  sanitationUnits: number;
  hasMedicalTriage: boolean;
  hasEmergencyHelipad: boolean;
  hasBackupPower: boolean;
  officerInCharge: {
    name: string;
    designation: string;
    phone: string;
  };
  status: 'available' | 'near_capacity' | 'overflow' | 'isolated';
}

export interface DisasterRegion {
  id: string;
  name: string;
  state: string;
  description: string;
  center: [number, number];
  zoom: number;
  habitations: Habitation[];
  safeSites: SafeSite[];
  hazardPolygons: HazardPolygon[];
}

export interface SimulationParams {
  rainfallAnomalyPercent: number; // e.g. +40%
  riverLevelRiseMeters: number; // e.g. +2.5m
  simulateBridgeCollapse: boolean;
  shelterCapacityFactor: number; // e.g. 0.8 for damaged facilities
  cloudburstZoneActive: boolean;
}

export interface IncidentStats {
  totalHabitations: number;
  immediateEvacuations: number;
  shortTermWatch: number;
  mediumTermMitigation: number;
  totalPopulationAtRisk: number;
  immediatePeopleEvacuating: number;
  totalShelterCapacity: number;
  totalAssignedEvacuees: number;
  criticalCutoffBridges: number;
  shelterUtilizationPercent: number;
}
