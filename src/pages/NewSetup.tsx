import { useEffect, useMemo, useState } from "react";
import { Button, Card, Field, NumberInput, Select, TextInput } from "../components/ui";
import { BUILT_IN_TRACKS } from "../data/tracks";
import { computeRecommendation } from "../lib/recommend";
import {
  bikeStore,
  customTrackStore,
  driverStore,
  newId,
  sessionStore,
  suspensionStore,
  tireSetStore,
  trackUserNoteStore,
} from "../lib/storage";
import { fetchCurrentWeather } from "../lib/weather";
import type { Recommendation, SetupSession, SurfaceRoughness, Track, WeatherSnapshot } from "../types";
import { useForceUpdate } from "./Profiles";

const SURFACE_LABELS: Record<SurfaceRoughness, string> = {
  fin: "Jevn/fin asfalt (kuratert)",
  middels: "Middels grov asfalt (kuratert)",
  grov: "Grov/humpete asfalt (kuratert)",
  ukjent: "Ukjent — ingen pålitelig kilde funnet",
};

export function NewSetupPage() {
  const refresh = useForceUpdate();
  const drivers = driverStore.all();
  const bikes = bikeStore.all();
  const tireSets = tireSetStore.all();
  const customTracks = customTrackStore.all();
  const allTracks = [...BUILT_IN_TRACKS, ...customTracks];

  const [driverId, setDriverId] = useState(drivers[0]?.id ?? "");
  const [bikeId, setBikeId] = useState(bikes[0]?.id ?? "");
  const suspensionsForBike = useMemo(() => suspensionStore.all().filter((s) => s.bikeId === bikeId), [bikeId]);
  const [suspensionId, setSuspensionId] = useState(suspensionsForBike[0]?.id ?? "");
  const [tireSetId, setTireSetId] = useState(tireSets[0]?.id ?? "");
  const [trackId, setTrackId] = useState(allTracks[0]?.id ?? "");
  const [notes, setNotes] = useState("");

  const [showCustomTrack, setShowCustomTrack] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customLat, setCustomLat] = useState<number | "">("");
  const [customLon, setCustomLon] = useState<number | "">("");

  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [saved, setSaved] = useState(false);

  const selectedTrack = allTracks.find((t) => t.id === trackId);

  const [trackUserNote, setTrackUserNote] = useState(() => trackUserNoteStore.get(trackId));
  const [trackNoteSaved, setTrackNoteSaved] = useState(false);

  useEffect(() => {
    setTrackUserNote(trackUserNoteStore.get(trackId));
    setTrackNoteSaved(false);
  }, [trackId]);

  function saveTrackUserNote() {
    trackUserNoteStore.set(trackId, trackUserNote);
    setTrackNoteSaved(true);
  }

  function saveCustomTrack() {
    if (!customName.trim() || customLat === "" || customLon === "") return;
    const track: Track = { id: newId(), name: customName.trim(), lat: Number(customLat), lon: Number(customLon), isCustom: true };
    customTrackStore.upsert(track);
    setTrackId(track.id);
    setShowCustomTrack(false);
    setCustomName("");
    setCustomLat("");
    setCustomLon("");
    refresh();
  }

  async function loadWeather() {
    if (!selectedTrack) return;
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const snapshot = await fetchCurrentWeather(selectedTrack.lat, selectedTrack.lon);
      setWeather(snapshot);
    } catch (err) {
      setWeatherError(err instanceof Error ? err.message : "Ukjent feil ved henting av vær");
    } finally {
      setWeatherLoading(false);
    }
  }

  function generateRecommendation() {
    const driver = drivers.find((d) => d.id === driverId);
    const bike = bikes.find((b) => b.id === bikeId);
    const suspension = suspensionsForBike.find((s) => s.id === suspensionId);
    const tires = tireSets.find((t) => t.id === tireSetId);
    if (!driver || !bike || !suspension || !tires) return;
    setRecommendation(computeRecommendation(driver, bike, suspension, tires, weather, selectedTrack, trackUserNote));
    setSaved(false);
  }

  function saveSession() {
    if (!recommendation) return;
    const session: SetupSession = {
      id: newId(),
      createdAt: new Date().toISOString(),
      driverId,
      bikeId,
      suspensionId,
      tireSetId,
      trackId,
      weather,
      recommendation,
      notes,
    };
    sessionStore.upsert(session);
    setSaved(true);
  }

  const missingData = drivers.length === 0 || bikes.length === 0 || tireSets.length === 0;

  if (missingData) {
    return (
      <Card title="Nytt oppsett">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Du må legge inn minst én sjåfør, én motorsykkel og ett dekksett under "Profiler" før du kan lage et oppsett.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="1. Velg utstyr">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Sjåfør">
            <Select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Motorsykkel">
            <Select
              value={bikeId}
              onChange={(e) => {
                setBikeId(e.target.value);
                const next = suspensionStore.all().filter((s) => s.bikeId === e.target.value);
                setSuspensionId(next[0]?.id ?? "");
              }}
            >
              {bikes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Demperoppsett">
            <Select value={suspensionId} onChange={(e) => setSuspensionId(e.target.value)} disabled={suspensionsForBike.length === 0}>
              {suspensionsForBike.length === 0 && <option value="">Ingen registrert for denne MC-en</option>}
              {suspensionsForBike.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.frontBrand} / {s.rearBrand}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Dekksett">
            <Select value={tireSetId} onChange={(e) => setTireSetId(e.target.value)}>
              {tireSets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.brand} {t.model} ({t.compound})
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card title="2. Velg bane og hent vær">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Bane">
            <Select value={trackId} onChange={(e) => setTrackId(e.target.value)}>
              {allTracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={() => setShowCustomTrack((v) => !v)}>
              {showCustomTrack ? "Avbryt" : "Legg til egen bane"}
            </Button>
            <Button onClick={loadWeather} disabled={weatherLoading}>
              {weatherLoading ? "Henter vær…" : "Hent værdata"}
            </Button>
          </div>
        </div>

        {showCustomTrack && (
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-black/10 p-3 sm:grid-cols-4 dark:border-white/10">
            <Field label="Navn">
              <TextInput value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Min bane" />
            </Field>
            <Field label="Breddegrad (lat)">
              <NumberInput
                step="0.0001"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="59.37"
              />
            </Field>
            <Field label="Lengdegrad (lon)">
              <NumberInput
                step="0.0001"
                value={customLon}
                onChange={(e) => setCustomLon(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="11.27"
              />
            </Field>
            <div className="flex items-end">
              <Button onClick={saveCustomTrack}>Lagre bane</Button>
            </div>
          </div>
        )}

        {selectedTrack && (
          <div className="mt-4 rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
            <div className="mb-1 font-semibold">
              Banedekke: {SURFACE_LABELS[selectedTrack.surfaceRoughness ?? "ukjent"]}
            </div>
            {selectedTrack.surfaceNotes ? (
              <p className="text-neutral-600 dark:text-neutral-400">{selectedTrack.surfaceNotes}</p>
            ) : (
              <p className="text-neutral-500">Ingen kuratert info om banedekket for denne banen ennå.</p>
            )}
            <div className="mt-3">
              <Field label="Dine egne notater om banen (lagres kun i din nettleser)">
                <textarea
                  className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-white/15 dark:bg-neutral-800"
                  rows={2}
                  value={trackUserNote}
                  onChange={(e) => {
                    setTrackUserNote(e.target.value);
                    setTrackNoteSaved(false);
                  }}
                  placeholder="F.eks. humpete i sving 4, mye grep i regn…"
                />
              </Field>
              <div className="mt-2 flex items-center gap-3">
                <Button variant="secondary" onClick={saveTrackUserNote}>
                  Lagre notat
                </Button>
                {trackNoteSaved && <span className="text-sm text-green-600">Lagret ✓</span>}
              </div>
            </div>
          </div>
        )}

        {weatherError && <p className="mt-3 text-sm text-red-600">{weatherError}</p>}
        {weather && (
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-neutral-100 p-3 text-sm sm:grid-cols-4 dark:bg-neutral-800">
            <div>
              <div className="text-neutral-500">Temperatur</div>
              <div className="font-semibold">{weather.airTempC.toFixed(1)} °C</div>
            </div>
            <div>
              <div className="text-neutral-500">Vind</div>
              <div className="font-semibold">{weather.windSpeedMs.toFixed(1)} m/s</div>
            </div>
            <div>
              <div className="text-neutral-500">Nedbør (neste time)</div>
              <div className="font-semibold">{weather.precipitationMmHr.toFixed(1)} mm</div>
            </div>
            <div>
              <div className="text-neutral-500">Skydekke</div>
              <div className="font-semibold">{Math.round(weather.cloudCoverPercent)}%</div>
            </div>
          </div>
        )}
      </Card>

      <Card title="3. Generer anbefaling">
        <Button onClick={generateRecommendation}>Beregn anbefalt oppsett</Button>

        {recommendation && (
          <div className="mt-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
                <h3 className="mb-2 font-semibold">Dempere</h3>
                <ul className="flex flex-col gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <li>
                    <strong>Front sag-mål:</strong> {recommendation.suspension.frontSagTargetMm}
                  </li>
                  <li>
                    <strong>Bak sag-mål:</strong> {recommendation.suspension.rearSagTargetMm}
                  </li>
                  <li>
                    <strong>Forspenning:</strong> {recommendation.suspension.frontPreloadNote}
                  </li>
                  <li>
                    <strong>Kompresjon:</strong> {recommendation.suspension.compressionNote}
                  </li>
                  <li>
                    <strong>Retur:</strong> {recommendation.suspension.reboundNote}
                  </li>
                </ul>
              </div>
              <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
                <h3 className="mb-2 font-semibold">Dekktrykk (kaldt)</h3>
                <div className="mb-2 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-neutral-500">Fram</div>
                    <div className="text-xl font-bold">
                      {recommendation.tires.frontColdPsi} psi <span className="text-sm font-normal text-neutral-500">({recommendation.tires.frontColdKpa} kPa)</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Bak</div>
                    <div className="text-xl font-bold">
                      {recommendation.tires.rearColdPsi} psi <span className="text-sm font-normal text-neutral-500">({recommendation.tires.rearColdKpa} kPa)</span>
                    </div>
                  </div>
                </div>
                <ul className="flex flex-col gap-1 text-sm text-neutral-700 dark:text-neutral-300">
                  {recommendation.tires.notes.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              {recommendation.generalNotes.map((n, i) => (
                <p key={i}>{n}</p>
              ))}
            </div>

            <Field label="Notater til denne økten">
              <textarea
                className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-white/15 dark:bg-neutral-800"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="F.eks. hvordan sykkelen føltes, endringer gjort på banen…"
              />
            </Field>

            <div className="flex items-center gap-3">
              <Button onClick={saveSession}>Lagre denne økten</Button>
              {saved && <span className="text-sm text-green-600">Lagret i historikk ✓</span>}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
