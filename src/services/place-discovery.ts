import type { MapPoint } from '@/components/map-surface.types';
import type { NearbyPlaceSuggestion, PlaceSearchRecord } from '@/interface/trips';
import { tripsService } from '@/services/tripsService';

export type PlaceResult = MapPoint & {
  category: string;
  address: string;
  description: string;
  country?: string;
  isCountry?: boolean;
  source?: string;
  sourceUrl?: string;
  verified?: boolean;
};

function mapSearchPlace(place: PlaceSearchRecord): PlaceResult | null {
  const latitude = place.latitude ?? place.lat;
  const longitude = place.longitude ?? place.lng;
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) return null;
  return {
    id: place.id,
    name: place.name,
    latitude,
    longitude,
    category: place.category ?? place.place_type ?? 'Lieu',
    address: place.address ?? place.description,
    description: place.description || place.name,
    country: place.country ?? undefined,
    isCountry: place.isCountry,
  };
}

function mapNearbyPlace(place: NearbyPlaceSuggestion): PlaceResult {
  return {
    id: place.id,
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    category: place.category,
    address: place.address,
    description: place.description,
    source: place.source,
    sourceUrl: place.sourceUrl,
    verified: place.verified,
  };
}

export async function searchAfrica(query: string, country?: string): Promise<PlaceResult[]> {
  const results = await tripsService.searchPlaces(query, country);
  return results.map(mapSearchPlace).filter((place): place is PlaceResult => place !== null);
}

export async function findNearby(latitude: number, longitude: number, category: string, location = 'ce quartier'): Promise<PlaceResult[]> {
  const results = await tripsService.fetchNearbyPlaces(latitude, longitude, category, location);
  return results.map(mapNearbyPlace);
}
