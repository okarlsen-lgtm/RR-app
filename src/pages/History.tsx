import { Button, Card } from "../components/ui";
import { BUILT_IN_TRACKS } from "../data/tracks";
import { bikeStore, customTrackStore, driverStore, sessionStore, tireSetStore } from "../lib/storage";
import { useForceUpdate } from "./Profiles";

export function HistoryPage() {
  const refresh = useForceUpdate();
  const sessions = [...sessionStore.all()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const drivers = driverStore.all();
  const bikes = bikeStore.all();
  const tireSets = tireSetStore.all();
  const tracks = [...BUILT_IN_TRACKS, ...customTrackStore.all()];

  if (sessions.length === 0) {
    return (
      <Card title="Historikk">
        <p className="text-sm text-neutral-500">Ingen lagrede oppsett ennå. Lag et nytt oppsett for å se det her.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((s) => {
        const driver = drivers.find((d) => d.id === s.driverId);
        const bike = bikes.find((b) => b.id === s.bikeId);
        const tires = tireSets.find((t) => t.id === s.tireSetId);
        const track = tracks.find((t) => t.id === s.trackId);
        return (
          <Card key={s.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">
                  {track?.name ?? "Ukjent bane"} · {new Date(s.createdAt).toLocaleString("nb-NO")}
                </div>
                <div className="text-sm text-neutral-500">
                  {driver?.name ?? "?"} på {bike?.name ?? "?"} · {tires ? `${tires.brand} ${tires.model}` : "?"}
                </div>
              </div>
              <Button
                variant="danger"
                className="!px-2 !py-1 text-xs"
                onClick={() => {
                  sessionStore.remove(s.id);
                  refresh();
                }}
              >
                Slett
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <strong>Dekktrykk:</strong> {s.recommendation.tires.frontColdPsi} / {s.recommendation.tires.rearColdPsi} psi (fram/bak)
              </div>
              {s.weather && (
                <div>
                  <strong>Vær:</strong> {s.weather.airTempC.toFixed(1)}°C, {s.weather.windSpeedMs.toFixed(1)} m/s vind
                </div>
              )}
            </div>
            {s.notes && <p className="mt-2 text-sm italic text-neutral-600 dark:text-neutral-400">"{s.notes}"</p>}
          </Card>
        );
      })}
    </div>
  );
}
