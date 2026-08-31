import type { Bike, Driver, SetupSession, SuspensionSetup, TireSet, Track } from "../types";

const KEYS = {
  drivers: "rr-app:drivers",
  bikes: "rr-app:bikes",
  suspensions: "rr-app:suspensions",
  tireSets: "rr-app:tireSets",
  customTracks: "rr-app:customTracks",
  sessions: "rr-app:sessions",
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
