import type { MapPoint } from '@/components/map-surface.types';
import { countryOptions, destinationOptions } from '@/data/map-mock';

export type PlaceResult = MapPoint & {
  category: string;
  address: string;
  description: string;
  country?: string;
  isCountry?: boolean;
};

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();

const activities: Record<string, { name: string; category: string; description: string; emoji: string }[]> = {
  Hébergements: [
    { name: 'Appartement lumineux', category: 'Appartement', description: '2 voyageurs · Wi-Fi · cuisine équipée · dès 18 000 XOF / nuit', emoji: '🏢' },
    { name: 'Studio des voyageurs', category: 'Studio', description: 'Quartier calme · climatisation · dès 24 000 XOF / nuit', emoji: '🛏️' },
    { name: 'Résidence avec terrasse', category: 'Résidence', description: '4 voyageurs · parking · dès 32 000 XOF / nuit', emoji: '🏡' },
  ],
  Restaurants: [
    { name: 'La Terrasse du marché', category: 'Restaurant', description: 'Cuisine locale · plats à partager · 10 000–16 000 XOF', emoji: '🍲' },
    { name: 'Café des voyageurs', category: 'Café', description: 'Petit-déjeuner · café · terrasse ombragée', emoji: '☕' },
    { name: 'Chez Awa', category: 'Restaurant', description: 'Spécialités maison · ambiance conviviale', emoji: '🥘' },
  ],
  Culture: [
    { name: 'Musée des cultures', category: 'Musée', description: 'Collections locales · visite 1 h 30', emoji: '🏛️' },
    { name: 'Place des artisans', category: 'Artisanat', description: 'Ateliers et créations fabriquées sur place', emoji: '🧵' },
    { name: 'Le quartier historique', category: 'Patrimoine', description: 'Architecture et histoire de la ville', emoji: '📷' },
  ],
  Nature: [
    { name: 'Jardin botanique', category: 'Nature', description: 'Promenade ombragée · idéal le matin', emoji: '🌿' },
    { name: 'La plage des pêcheurs', category: 'Plage', description: 'Coucher de soleil et pirogues colorées', emoji: '🏝️' },
    { name: 'Balade au bord de l’eau', category: 'Promenade', description: 'Parcours facile · environ 45 minutes', emoji: '🌊' },
  ],
  'À faire': [
    { name: 'Visite guidée de la ville', category: 'Activité', description: 'Guide local · départ à 9 h et 15 h', emoji: '🧭' },
    { name: 'Marché central', category: 'Marché', description: 'Saveurs, tissus et artisanat local', emoji: '🧺' },
    { name: 'Atelier cuisine locale', category: 'Expérience', description: 'Découverte et dégustation · 2 heures', emoji: '🍋' },
  ],
};

export function searchAfrica(query: string): PlaceResult[] {
  const needle = normalize(query);
  if (!needle) return [];
  const featured: PlaceResult[] = normalize('Place de l’Étoile Cotonou Bénin').includes(needle) || normalize('Place de l’Étoile').includes(needle) ? [{
    id: 'place-etoile-cotonou', name: 'Place de l’Étoile', latitude: 6.3702, longitude: 2.4251,
    category: 'Place', address: 'Cotonou, Bénin', description: 'Place de l’Étoile, Cotonou · point de rendez-vous de démonstration', country: 'Bénin',
  }] : [];
  const countries = countryOptions.filter((item) => normalize(item.name).includes(needle)).map((item): PlaceResult => ({
    id: `country-${normalize(item.name).replaceAll(' ', '-')}`, name: item.name, latitude: item.latitude, longitude: item.longitude,
    category: 'Pays', address: 'Afrique', description: `${item.emoji} ${item.name} · sélectionne ce pays pour voir les villes`, country: item.name, isCountry: true,
  }));
  const cities = destinationOptions.filter((item) => `${item.name} ${item.country} ${item.region}`.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(needle)).map((item): PlaceResult => ({
    id: item.id, name: item.name, latitude: item.latitude, longitude: item.longitude, category: 'Ville', address: `${item.region}, ${item.country}`,
    description: `${item.name}, ${item.country}`, country: item.country,
  }));
  return [...featured, ...countries, ...cities].slice(0, 8);
}

export function findNearby(latitude: number, longitude: number, category: string, location = "ce quartier"): PlaceResult[] {
  const catalog = activities[category] ?? activities['À faire'];
  return catalog.map((item, index) => ({
    id: `demo-${category}-${index}`, name: item.name,
    latitude: latitude + (index - 1) * 0.018, longitude: longitude + (index - 1) * 0.021,
    category: item.category, address: `À proximité de ${location} · adresse de démonstration`,
    description: `${item.emoji} ${item.description}`,
  }));
}
