import { Linking } from 'react-native';

export type Coordinate = {
  label?: string;
  address?: string;
  latitude: number;
  longitude: number;
};

export type RouteSummary = {
  distanceKm: number;
  etaMinutes: number;
  source: 'osrm' | 'local';
};

const OSRM_TIMEOUT_MS = 3500;
const AVERAGE_CITY_SPEED_KPH = 24;

function toCoordParam(coord: Coordinate) {
  return `${coord.latitude},${coord.longitude}`;
}

function toOsrmParam(coord: Coordinate) {
  return `${coord.longitude},${coord.latitude}`;
}

export function makeGoogleMapsDirectionsUrl(origin: Coordinate, destination: Coordinate) {
  const originCoord = toCoordParam(origin);
  const destinationCoord = toCoordParam(destination);
  return `https://www.google.com/maps/dir/?api=1&origin=${originCoord}&destination=${destinationCoord}&travelmode=driving`;
}

export async function openDirections(origin: Coordinate, destination: Coordinate) {
  await Linking.openURL(makeGoogleMapsDirectionsUrl(origin, destination));
}

export function estimateRouteSummary(origin: Coordinate, destination: Coordinate): RouteSummary {
  const distanceKm = haversineKm(origin, destination) * 1.32;
  return {
    distanceKm,
    etaMinutes: Math.max(3, Math.round((distanceKm / AVERAGE_CITY_SPEED_KPH) * 60)),
    source: 'local',
  };
}

export async function getFreeRouteSummary(
  origin: Coordinate,
  destination: Coordinate,
): Promise<RouteSummary> {
  const fallback = estimateRouteSummary(origin, destination);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);

  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/${toOsrmParam(origin)};${toOsrmParam(destination)}` +
      '?overview=false&alternatives=false&steps=false';
    const response = await fetch(url, { signal: controller.signal });
    const json = await response.json();
    const route = json?.routes?.[0];
    if (!response.ok || !route) return fallback;

    return {
      distanceKm: Number(route.distance ?? fallback.distanceKm * 1000) / 1000,
      etaMinutes: Math.max(1, Math.round(Number(route.duration ?? fallback.etaMinutes * 60) / 60)),
      source: 'osrm',
    };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

export function haversineKm(a: Coordinate, b: Coordinate) {
  const earthRadiusKm = 6371;
  const dLat = degreesToRadians(b.latitude - a.latitude);
  const dLng = degreesToRadians(b.longitude - a.longitude);
  const lat1 = degreesToRadians(a.latitude);
  const lat2 = degreesToRadians(b.latitude);
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}
