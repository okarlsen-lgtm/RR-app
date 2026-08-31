import type { Bike, Driver, SetupSession, SuspensionSetup, TireSet, Track } from "../types";

const KEYS = {
  drivers: "rr-app:drivers",
  bikes: "rr-app:bikes",
  suspensions: "rr-app:suspensions",
  tireSets: "rr-app:tireSets",
  customTracks: "rr-app:customTracks",
  sessions: "rr-app:sessions",
  trackUserNotes: "rr-app:trackUserNotes",
} as const;

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

function makeCollection<T extends { id: string }>(key: string) {
  return {
    all(): T[] {
      return load<T>(key);
    },
    get(id: string): T | undefined {
      return load<T>(key).find((item) => item.id === id);
    },
    upsert(item: T) {
      const items = load<T>(key);
      const idx = items.findIndex((existing) => existing.id === item.id);
      if (idx >= 0) items[idx] = item;
      else items.push(item);
      save(key, items);
    },
    remove(id: string) {
      save(
        key,
        load<T>(key).filter((item) => item.id !== id),
      );
    },
  };
}

export const driverStore = makeCollection<Driver>(KEYS.drivers);
export const bikeStore = makeCollection<Bike>(KEYS.bikes);
export const suspensionStore = makeCollection<SuspensionSetup>(KEYS.suspensions);
export const tireSetStore = makeCollection<TireSet>(KEYS.tireSets);
export const customTrackStore = makeCollection<Track>(KEYS.customTracks);
export const sessionStore = makeCollection<SetupSession>(KEYS.sessions);

export function newId(): string {
  return crypto.randomUUID();
}

/**
 * Egne, redigerbare notater om baner (f.eks. banedekke) — separat fra de
 * kuraterte notatene i data/tracks.ts, slik at brukerens erfaring aldri
 * overskrives av fremtidige oppdateringer av den kuraterte listen.
 */
function loadNoteMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(KEYS.trackUserNotes);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export const trackUserNoteStore = {
  get(trackId: string): string {
    return loadNoteMap()[trackId] ?? "";
  },
  set(trackId: string, note: string) {
    const map = loadNoteMap();
    if (note.trim()) map[trackId] = note;
    else delete map[trackId];
    localStorage.setItem(KEYS.trackUserNotes, JSON.stringify(map));
  },
};
