export type DestinationOption = {
  id: string;
  name: string;
  region: string;
  country: string;
  emoji: string;
  latitude: number;
  longitude: number;
};
export type CountryOption = { name: string; emoji: string; latitude: number; longitude: number; zoom: number };

// Pays d’exemple pour la démo. La recherche permet aussi de trouver les autres pays africains.
export const countryOptions: CountryOption[] = [
  { name: 'Bénin', emoji: '🇧🇯', latitude: 9.5, longitude: 2.3, zoom: 4 },
  { name: 'Togo', emoji: '🇹🇬', latitude: 8.6, longitude: 1.1, zoom: 5 },
  { name: 'Ghana', emoji: '🇬🇭', latitude: 7.9, longitude: -1.0, zoom: 4 },
  { name: 'Sénégal', emoji: '🇸🇳', latitude: 14.4, longitude: -14.5, zoom: 4 },
  { name: "Côte d’Ivoire", emoji: '🇨🇮', latitude: 7.5, longitude: -5.5, zoom: 4 },
  { name: 'Maroc', emoji: '🇲🇦', latitude: 31.8, longitude: -6.0, zoom: 4 },
  { name: 'Kenya', emoji: '🇰🇪', latitude: 0.2, longitude: 37.9, zoom: 4 },
  { name: 'Rwanda', emoji: '🇷🇼', latitude: -2.0, longitude: 29.9, zoom: 6 },
  { name: 'Afrique du Sud', emoji: '🇿🇦', latitude: -29.0, longitude: 24.0, zoom: 3 },
];

export const destinationOptions: DestinationOption[] = [
  { id: 'cotonou', name: 'Cotonou', region: 'Littoral', country: 'Bénin', emoji: '🌆', latitude: 6.3654, longitude: 2.4183 },
  { id: 'porto-novo', name: 'Porto-Novo', region: 'Ouémé', country: 'Bénin', emoji: '🏛️', latitude: 6.4969, longitude: 2.6289 },
  { id: 'ouidah', name: 'Ouidah', region: 'Atlantique', country: 'Bénin', emoji: '🏛️', latitude: 6.3631, longitude: 2.0851 },
  { id: 'grand-popo', name: 'Grand-Popo', region: 'Mono', country: 'Bénin', emoji: '🏝️', latitude: 6.2804, longitude: 1.8225 },
  { id: 'abomey', name: 'Abomey', region: 'Zou', country: 'Bénin', emoji: '🏺', latitude: 7.1829, longitude: 1.9912 },
  { id: 'ganvie', name: 'Ganvié', region: 'Atlantique', country: 'Bénin', emoji: '🛶', latitude: 6.4667, longitude: 2.4167 },
  { id: 'lome', name: 'Lomé', region: 'Maritime', country: 'Togo', emoji: '🌴', latitude: 6.1319, longitude: 1.2228 },
  { id: 'kpalime', name: 'Kpalimé', region: 'Plateaux', country: 'Togo', emoji: '🌿', latitude: 6.9000, longitude: 0.6333 },
  { id: 'accra', name: 'Accra', region: 'Greater Accra', country: 'Ghana', emoji: '🎨', latitude: 5.6037, longitude: -0.1870 },
  { id: 'cape-coast', name: 'Cape Coast', region: 'Central', country: 'Ghana', emoji: '🏰', latitude: 5.1053, longitude: -1.2466 },
  { id: 'dakar', name: 'Dakar', region: 'Dakar', country: 'Sénégal', emoji: '🌊', latitude: 14.7167, longitude: -17.4677 },
  { id: 'saint-louis', name: 'Saint-Louis', region: 'Saint-Louis', country: 'Sénégal', emoji: '🏘️', latitude: 16.0326, longitude: -16.4818 },
  { id: 'abidjan', name: 'Abidjan', region: 'Lagunes', country: "Côte d’Ivoire", emoji: '🌇', latitude: 5.3600, longitude: -4.0083 },
  { id: 'yamoussoukro', name: 'Yamoussoukro', region: 'Lacs', country: "Côte d’Ivoire", emoji: '🏛️', latitude: 6.8276, longitude: -5.2893 },
  { id: 'marrakech', name: 'Marrakech', region: 'Marrakech-Safi', country: 'Maroc', emoji: '🕌', latitude: 31.6295, longitude: -7.9811 },
  { id: 'nairobi', name: 'Nairobi', region: 'Nairobi', country: 'Kenya', emoji: '🦒', latitude: -1.2921, longitude: 36.8219 },
  { id: 'kigali', name: 'Kigali', region: 'Kigali', country: 'Rwanda', emoji: '🌿', latitude: -1.9441, longitude: 30.0619 },
  { id: 'cape-town', name: 'Le Cap', region: 'Cap-Occidental', country: 'Afrique du Sud', emoji: '⛰️', latitude: -33.9249, longitude: 18.4241 },
];

export const suggestedRoutes = [
  { id: 'cote-des-pecheurs', country: 'Bénin', name: 'La côte des pêcheurs', subtitle: 'Cotonou → Ouidah → Grand-Popo', days: '3 jours', distance: '142 km', emoji: '🌊', tint: '#E6F0E9', stops: ['Cotonou', 'Ouidah', 'Grand-Popo'] },
  { id: 'escapade-togo', country: 'Togo', name: 'Escapade au Togo', subtitle: 'Lomé → Kpalimé', days: '4 jours', distance: '186 km', emoji: '🌴', tint: '#F3EBDD', stops: ['Lomé', 'Kpalimé'] },
  { id: 'lagune-aux-palmiers', country: 'Bénin', name: 'Lagon et palmiers', subtitle: 'Cotonou → Ganvié → Ouidah', days: '2 jours', distance: '74 km', emoji: '🛶', tint: '#E8E9F2', stops: ['Cotonou', 'Ganvié', 'Ouidah'] },
];
