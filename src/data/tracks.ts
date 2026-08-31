import type { Track } from "../types";

/**
 * Forhåndsdefinerte baner som brukes til roadracing i Norge (og et par i Sverige
 * som norske førere ofte kjører på). Koordinater er tilnærmet (banens senter) og
 * brukes til å hente værdata — legg gjerne til egen bane med mer presise
 * koordinater om nødvendig.
 *
 * surfaceRoughness/surfaceNotes er kuratert fra offentlig tilgjengelige kilder
 * (banenes egne nettsider, RacingCircuits.info, Wikipedia m.fl.) — IKKE målte
 * data. Der vi ikke fant pålitelig informasjon står det eksplisitt. Bruk egne
 * notater i appen for å supplere/korrigere basert på faktisk erfaring.
 */
export const BUILT_IN_TRACKS: Track[] = [
  {
    id: "arctic-circle",
    name: "Arctic Circle Raceway",
    lat: 66.4238,
    lon: 14.4465,
    lengthKm: 3.753,
    surfaceRoughness: "fin",
    surfaceNotes:
      "Skreddersydd asfaltblanding utviklet for å tåle det arktiske klimaet. Beskrives som svært jevn og i god stand, og skal ikke ha vært reasfaltert siden åpningen. Kilde: snaplap.net, allalongtheracetrack.co.uk.",
  },
  {
    id: "rudskogen",
    name: "Rudskogen Motorsenter",
    lat: 59.3703,
    lon: 11.2711,
    lengthKm: 3.242,
    surfaceRoughness: "ukjent",
    surfaceNotes:
      "Fant ingen offentlig informasjon spesifikt om banedekkets grovhet/grep. Anlegget fikk en stor oppgradering (175 MNOK, nytt hovedbygg m.m.) i 2024, men det er uklart om selve asfalten ble fornyet. Supplér gjerne med egen erfaring.",
  },
  {
    id: "valerbanen",
    name: "Vålerbanen",
    lat: 59.5312,
    lon: 10.7524,
    lengthKm: 2.0,
    surfaceRoughness: "ukjent",
    surfaceNotes:
      "Bekreftet 100% asfaltert bane (del av NAF Trafikksenter), men ingen offentlig info funnet om grovhet/grep spesifikt. Merk: anlegget har flere delbaner av ulik lengde/standard — sjekk hvilken variant du faktisk kjører på.",
  },
  {
    id: "froland",
    name: "Frøland Motorsenter",
    lat: 58.4886,
    lon: 8.5339,
    lengthKm: 1.8,
    surfaceRoughness: "ukjent",
    surfaceNotes: "Fant ingen pålitelig offentlig informasjon om banedekket for denne banen. Supplér gjerne med egen erfaring.",
  },
  {
    id: "anderstorp",
    name: "Anderstorp Raceway (SE)",
    lat: 57.2666,
    lon: 13.6032,
    lengthKm: 4.0,
    surfaceRoughness: "middels",
    surfaceNotes:
      "Beskrives som stort sett jevn, men med enkelte humpete seksjoner som krever nøye demperoppsett. Overflaten karakteriseres også som slitesterk/abrasiv, noe som påvirker dekkslitasje. Ingen bekreftet nylig reasfaltering funnet. Kilde: lapmeta.com.",
  },
  {
    id: "kinnekulle",
    name: "Kinnekulle Ring (SE)",
    lat: 58.582,
    lon: 13.423,
    lengthKm: 2.336,
    surfaceRoughness: "middels",
    surfaceNotes:
      "Blanding av asfalt og betong-seksjoner (bl.a. under brupartiet), med camber-variasjoner i enkelte svinger. Kan være utfordrende i våte forhold. Kilde: racingcircuits.info, grokipedia.com.",
  },
  {
    id: "karlskoga",
    name: "Karlskoga Motorstadion (SE)",
    lat: 59.326,
    lon: 14.499,
    lengthKm: 1.8,
    surfaceRoughness: "ukjent",
    surfaceNotes:
      "Sveriges eldste permanente motorbane (asfaltert siden 1952, utvidet flere ganger). Ingen offentlig info funnet om dagens banedekke/grep. Supplér gjerne med egen erfaring.",
  },
];
