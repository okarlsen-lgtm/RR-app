import type { WeatherSnapshot } from "../types";

const ENDPOINT = "https://api.met.no/weatherapi/locationforecast/2.0/compact";

interface MetTimeseriesEntry {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        wind_speed: number;
        wind_from_direction: number;
        cloud_area_fraction: number;
      };
    };
    next_1_hours?: {
      details?: {
        precipitation_amount?: number;
      };
      summary?: {
        symbol_code: string;
      };
    };
  };
}

interface MetResponse {
  properties: {
    timeseries: MetTimeseriesEntry[];
  };
}

/**
 * Henter gjeldende værdata for et punkt fra MET Norways gratis, åpne
 * Locationforecast-API (samme datakilde som yr.no). Merk: MET ber om en
 * identifiserende User-Agent for server-til-server-bruk, men nettlesere
 * tillater ikke at fetch overstyrer denne headeren – her går kallet direkte
 * fra nettleseren, som er innenfor det API-et støtter for klientapper.
 */
export async function fetchCurrentWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const url = `${ENDPOINT}?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Klarte ikke å hente værdata (status ${res.status})`);
  }
  const json = (await res.json()) as MetResponse;
  const first = json.properties.timeseries[0];
  if (!first) {
    throw new Error("Ingen værdata tilgjengelig for dette punktet");
  }

  return {
    fetchedAt: new Date().toISOString(),
    airTempC: first.data.instant.details.air_temperature,
    windSpeedMs: first.data.instant.details.wind_speed,
    windDirectionDeg: first.data.instant.details.wind_from_direction,
    cloudCoverPercent: first.data.instant.details.cloud_area_fraction,
    precipitationMmHr: first.data.next_1_hours?.details?.precipitation_amount ?? 0,
    symbolCode: first.data.next_1_hours?.summary?.symbol_code ?? "unknown",
  };
}
