import type {
  Bike,
  Driver,
  Recommendation,
  SuspensionRecommendation,
  SuspensionSetup,
  TireCompound,
  TirePressureRecommendation,
  TireSet,
  Track,
  WeatherSnapshot,
} from "../types";

const PSI_TO_KPA = 6.89476;

const BASE_COLD_PSI: Record<TireCompound, { front: number; rear: number }> = {
  slick: { front: 29, rear: 26 },
  dot: { front: 31, rear: 29 },
  veidekk: { front: 34, rear: 32 },
  gate: { front: 24, rear: 22 },
};

/**
 * Grove, typiske våtvekter (kg) per kategori — brukes KUN som fallback når
 * brukeren ikke har fylt inn faktisk MC-vekt. Ikke modellspesifikke tall.
 */
const BIKE_DEFAULT_WEIGHT_KG: Record<Bike["category"], number> = {
  supersport: 187,
  superbike: 200,
  naken: 190,
  annet: 195,
};

const REFERENCE_RIDER_KG = 75;
const REFERENCE_BIKE_KG = 190;
const REFERENCE_SYSTEM_KG = REFERENCE_RIDER_KG + REFERENCE_BIKE_KG;

function effectiveBikeWeightKg(bike: Bike): { weight: number; estimated: boolean } {
  if (bike.weightKg) return { weight: bike.weightKg, estimated: false };
  return { weight: BIKE_DEFAULT_WEIGHT_KG[bike.category], estimated: true };
}

function isWet(weather: WeatherSnapshot | null): boolean {
  if (!weather) return false;
  return (
    weather.precipitationMmHr > 0.2 ||
    /rain|sleet|snow/.test(weather.symbolCode)
  );
}

export function computeTireRecommendation(
  driver: Driver,
  bike: Bike,
  tires: TireSet,
  weather: WeatherSnapshot | null,
): TirePressureRecommendation {
  const base = BASE_COLD_PSI[tires.compound];
  const notes: string[] = [];

  const { weight: bikeWeight, estimated } = effectiveBikeWeightKg(bike);
  const systemWeightDelta = driver.weightKg + bikeWeight - REFERENCE_SYSTEM_KG;
  const weightAdjustFront = clamp((systemWeightDelta / 10) * 0.15, -1, 1.2);
  const weightAdjustRear = clamp((systemWeightDelta / 10) * 0.3, -1.5, 2);
  if (estimated) {
    notes.push(
      `MC-vekt er ikke registrert — brukte et anslag på ${bikeWeight} kg for kategorien "${bike.category}". Fyll inn faktisk vekt under Profiler for mer presist trykk.`,
    );
  }

  let tempAdjust = 0;
  if (weather) {
    tempAdjust = clamp((20 - weather.airTempC) * 0.02, -1.5, 1.5);
  }

  let wearAdjustFront = 0;
  let wearAdjustRear = 0;
  if (tires.frontWearPercent > 60) wearAdjustFront += 0.5;
  if (tires.rearWearPercent > 60) wearAdjustRear += 0.5;
  if (tires.frontWearPercent > 80) {
    wearAdjustFront += 0.5;
    notes.push("Fordekk er kraftig slitt (>80%) — vurder å bytte før neste økt.");
  }
  if (tires.rearWearPercent > 80) {
    wearAdjustRear += 0.5;
    notes.push("Bakdekk er kraftig slitt (>80%) — vurder å bytte før neste økt.");
  }

  const wet = isWet(weather);
  if (wet && tires.compound !== "gate") {
    notes.push(
      "Meldingen viser våte forhold — vurder regndekk (gate) i stedet for dagens dekksett. Trykket under gjelder tørre forhold.",
    );
  }

  const frontColdPsi = round1(base.front + weightAdjustFront + tempAdjust + wearAdjustFront);
  const rearColdPsi = round1(base.rear + weightAdjustRear + tempAdjust + wearAdjustRear);

  notes.push(
    "Kaldtrykk målt før økten. Sjekk og juster varmt trykk etter noen runder — mål er stabilt driftstrykk, ikke bare kaldtrykket.",
  );

  return {
    frontColdPsi,
    rearColdPsi,
    frontColdKpa: Math.round(frontColdPsi * PSI_TO_KPA),
    rearColdKpa: Math.round(rearColdPsi * PSI_TO_KPA),
    notes,
  };
}

export function computeSuspensionRecommendation(
  driver: Driver,
  bike: Bike,
  _suspension: SuspensionSetup,
  track?: Track,
): SuspensionRecommendation {
  const { weight: bikeWeight, estimated } = effectiveBikeWeightKg(bike);
  const systemWeightDelta = driver.weightKg + bikeWeight - REFERENCE_SYSTEM_KG;

  let preloadHint = "Start med fabrikkinnstilt forspenning og juster til sag-målet.";
  if (systemWeightDelta > 15) {
    preloadHint = "Sjåfør + MC er tyngre enn referansen (75 kg sjåfør + 190 kg MC) — sett trolig mer forspenning enn standard, og vurder stivere fjær om sag-målet ikke nås.";
  } else if (systemWeightDelta < -15) {
    preloadHint = "Sjåfør + MC er lettere enn referansen (75 kg sjåfør + 190 kg MC) — sett trolig mindre forspenning enn standard, og vurder mykere fjær om sag-målet ikke nås.";
  }
  if (estimated) {
    preloadHint += ` (MC-vekt er anslått til ${bikeWeight} kg ut fra kategori — fyll inn faktisk vekt for et mer presist forslag.)`;
  }

  const experienceIsBeginner = driver.experience === "nybegynner" || driver.experience === "amatør";

  let compressionNote = experienceIsBeginner
    ? "Start 2–3 klikk mykere enn standard på kompresjon for bedre komfort og forutsigbarhet mens du blir kjent med banen."
    : "Øk kompresjonsdemping gradvis fra standard for mer støtte ved hard bremsing og i raske svinger — finjuster sving for sving.";

  if (track?.surfaceRoughness === "grov") {
    compressionNote +=
      " Banen er kuratert som grovere/humpete asfalt — vurder å starte litt mykere enn ellers for bedre hjulkontakt og komfort over ujevnheter.";
  } else if (track?.surfaceRoughness === "fin") {
    compressionNote += " Banen er kuratert som jevn/fin asfalt — mindre behov for komfortjustering, du kan gå friere på oppsettet for banefart.";
  }

  const reboundNote = experienceIsBeginner
    ? "Hold retur nær standardinnstilling til du har mer banetid — for rask retur føles nervøst, for treg gjør sykkelen tung i svingskifter."
    : "Juster retur for å balansere hjulkontakt over kanter mot stabilitet i svingskifter; test én endring om gangen.";

  return {
    frontPreloadNote: preloadHint,
    frontSagTargetMm: "30–35 mm statisk sag (fullt påkledd fører sittende på sykkelen)",
    rearPreloadNote: preloadHint,
    rearSagTargetMm: "25–30 mm statisk sag",
    compressionNote,
    reboundNote,
  };
}

export function computeRecommendation(
  driver: Driver,
  bike: Bike,
  suspension: SuspensionSetup,
  tires: TireSet,
  weather: WeatherSnapshot | null,
  track?: Track,
  trackUserNote?: string,
): Recommendation {
  const generalNotes = [
    "Dette er veiledende startpunkter basert på tommelfingerregler — fininnstill alltid på banen, og rådfør deg med en erfaren mekaniker/tuner ved tvil.",
  ];
  if (isWet(weather)) {
    generalNotes.push("Våte forhold meldt — kjør forsiktig ut av boksen og bygg opp fart/varme gradvis.");
  }
  if (track?.surfaceNotes) {
    generalNotes.push(`Om banedekket (kuratert, ikke målt): ${track.surfaceNotes}`);
  }
  if (trackUserNote?.trim()) {
    generalNotes.push(`Dine egne notater om banen: ${trackUserNote.trim()}`);
  }

  return {
    suspension: computeSuspensionRecommendation(driver, bike, suspension, track),
    tires: computeTireRecommendation(driver, bike, tires, weather),
    generalNotes,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
