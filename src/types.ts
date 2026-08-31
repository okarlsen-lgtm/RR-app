export type ExperienceLevel = "nybegynner" | "amatør" | "viderekommen" | "ekspert";

export interface Driver {
  id: string;
  name: string;
  weightKg: number;
  heightCm: number;
  experience: ExperienceLevel;
}

export type BikeCategory = "supersport" | "superbike" | "naken" | "annet";

export interface Bike {
  id: string;
  name: string;
  category: BikeCategory;
  weightKg?: number;
}

export interface SuspensionSetup {
  id: string;
  bikeId: string;
  frontBrand: string;
  frontModel: string;
  frontTravelMm?: number;
  rearBrand: string;
  rearModel: string;
  rearTravelMm?: number;
  adjustablePreload: boolean;
  adjustableCompression: boolean;
  adjustableRebound: boolean;
}

export type TireCompound = "slick" | "dot" | "gate" | "veidekk";

export interface TireSet {
  id: string;
  brand: string;
  model: string;
  compound: TireCompound;
  /** 0 = helt nytt dekk, 100 = utslitt */
  frontWearPercent: number;
  rearWearPercent: number;
}

export interface Track {
  id: string;
  name: string;
  lat: number;
  lon: number;
  lengthKm?: number;
  isCustom?: boolean;
}

export interface WeatherSnapshot {
  fetchedAt: string;
  airTempC: number;
  windSpeedMs: number;
  windDirectionDeg: number;
  precipitationMmHr: number;
  cloudCoverPercent: number;
  symbolCode: string;
}

export interface SuspensionRecommendation {
  frontPreloadNote: string;
  frontSagTargetMm: string;
  rearPreloadNote: string;
  rearSagTargetMm: string;
  compressionNote: string;
  reboundNote: string;
}

export interface TirePressureRecommendation {
  frontColdPsi: number;
  rearColdPsi: number;
  frontColdKpa: number;
  rearColdKpa: number;
  notes: string[];
}

export interface Recommendation {
  suspension: SuspensionRecommendation;
  tires: TirePressureRecommendation;
  generalNotes: string[];
}

export interface SetupSession {
  id: string;
  createdAt: string;
  driverId: string;
  bikeId: string;
  suspensionId: string;
  tireSetId: string;
  trackId: string;
  weather: WeatherSnapshot | null;
  recommendation: Recommendation;
  notes: string;
}
