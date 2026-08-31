import type { Track } from "../types";

/**
 * Forhåndsdefinerte baner som brukes til roadracing i Norge (og et par i Sverige
 * som norske førere ofte kjører på). Koordinater er tilnærmet (banens senter) og
 * brukes til å hente værdata — legg gjerne til egen bane med mer presise
 * koordinater om nødvendig.
 */
export const BUILT_IN_TRACKS: Track[] = [
  { id: "arctic-circle", name: "Arctic Circle Raceway", lat: 66.4238, lon: 14.4465, lengthKm: 3.753 },
  { id: "rudskogen", name: "Rudskogen Motorsenter", lat: 59.3703, lon: 11.2711, lengthKm: 3.242 },
  { id: "valerbanen", name: "Vålerbanen", lat: 59.5312, lon: 10.7524, lengthKm: 2.0 },
  { id: "froland", name: "Frøland Motorsenter", lat: 58.4886, lon: 8.5339, lengthKm: 1.8 },
  { id: "momarken", name: "Momarken Motorpark", lat: 59.5488, lon: 11.3277, lengthKm: 1.4 },
  { id: "anderstorp", name: "Anderstorp Raceway (SE)", lat: 57.2666, lon: 13.6032, lengthKm: 4.0 },
  { id: "kinnekulle", name: "Kinnekulle Ring (SE)", lat: 58.582, lon: 13.423, lengthKm: 2.336 },
  { id: "karlskoga", name: "Karlskoga Motorstadion (SE)", lat: 59.326, lon: 14.499, lengthKm: 1.8 },
];
