import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Header, Surface, s } from '@/components/app-ui';
import MapSurface from '@/components/map-surface';
import type { MapPoint } from '@/components/map-surface.types';
import { countryOptions, destinationOptions, suggestedRoutes } from '@/data/map-mock';
import { findNearby, searchAfrica, type PlaceResult } from '@/services/place-discovery';

const categories = ['Hébergements', 'Restaurants', 'Culture', 'Nature', 'À faire'];
const africaCenter = { latitude: 2, longitude: 18 };

type Mode = 'trip' | 'outing';

export default function MapScreen() {
  const params = useLocalSearchParams<{mode?: string}>();
  const [mode, setMode] = useState<Mode>(params.mode === 'outing' ? 'outing' : 'trip');
  const [category, setCategory] = useState<string>(params.mode === 'outing' ? 'Restaurants' : 'Culture');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [nearby, setNearby] = useState<PlaceResult[]>([]);
  const [selected, setSelected] = useState<PlaceResult | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [center, setCenter] = useState(africaCenter);
  const [mapZoom, setMapZoom] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const samplePoints: MapPoint[] = useMemo(() => destinationOptions.map((item) => ({ id: item.id, name: item.name, latitude: item.latitude, longitude: item.longitude })), []);
  const countryCities = selectedCountry ? destinationOptions.filter((place) => normalizeCountryName(place.country) === normalizeCountryName(selectedCountry)) : [];
  const countryCenter = countryOptions.find((item) => normalizeCountryName(item.name) === normalizeCountryName(selectedCountry ?? ''));
  const mapPoints: MapPoint[] = selected
    ? [{ id: selected.id, name: selected.name, latitude: selected.latitude, longitude: selected.longitude }, ...nearby.filter((place) => place.id !== selected.id).map(({ id, name, latitude, longitude }) => ({ id, name, latitude, longitude }))]
    : searchResults.length
      ? searchResults.map(({ id, name, latitude, longitude }) => ({ id, name, latitude, longitude }))
      : selectedCountry
        ? [...(countryCenter ? [{ id: `country-${selectedCountry}`, name: selectedCountry, latitude: countryCenter.latitude, longitude: countryCenter.longitude }] : []), ...countryCities.map(({ id, name, latitude, longitude }) => ({ id, name, latitude, longitude }))]
        : [];
  const visiblePoints = mapPoints.length ? mapPoints : selectedCountry ? [] : samplePoints;
  const selectedOption = destinationOptions.find((item) => item.id === selected?.id);

  async function submitSearch() {
    if (!query.trim()) return;
    setBusy(true); setMessage('Recherche dans le catalogue de démonstration…'); setNearby([]); setSelected(null); setSelectedCountry(null); setSelectedRoute(null); setCenter(africaCenter); setMapZoom(0);
    try {
      const found = searchAfrica(query);
      setSearchResults(found);
      setMessage(found.length ? 'Choisis le bon lieu dans les résultats.' : 'Aucun résultat en Afrique. Essaie une ville, un pays ou un quartier.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Recherche de démonstration indisponible.');
    } finally { setBusy(false); }
  }

  async function loadNearby(place: PlaceResult, activeCategory = category) {
    setSelected(place); if (place.country) setSelectedCountry(countryOptions.find((item) => normalizeCountryName(item.name) === normalizeCountryName(place.country ?? ''))?.name ?? place.country); setCenter({ latitude: place.latitude, longitude: place.longitude }); setMapZoom(10); setSearchResults([]); setBusy(true); setMessage(`Suggestions de démonstration : ${activeCategory.toLowerCase()} autour de ${place.name}…`);
    try {
      const found = findNearby(place.latitude, place.longitude, activeCategory, place.name);
      setNearby(found);
      setMessage(found.length ? `${found.length} lieux trouvés autour de ${place.name}.` : `Pas de résultat pour cette catégorie autour de ${place.name}.`);
    } catch (error) {
      setNearby([]);
      setMessage(error instanceof Error ? error.message : 'Impossible d’afficher les suggestions locales.');
    } finally { setBusy(false); }
  }

  function chooseCountry(name: string, latitude?: number, longitude?: number) {
    const option = countryOptions.find((item) => normalizeCountryName(item.name) === normalizeCountryName(name));
    const country = option?.name ?? name;
    setSelectedCountry(country); setSelected(null); setNearby([]); setSearchResults([]); setSelectedRoute(null); setQuery(country);
    setCenter({ latitude: latitude ?? option?.latitude ?? africaCenter.latitude, longitude: longitude ?? option?.longitude ?? africaCenter.longitude });
    setMapZoom(option?.zoom ?? 4);
    setMessage(`Pays choisi : ${country}. Choisis une ville pour découvrir les lieux à visiter.`);
  }

  function clearCountry() {
    setSelectedCountry(null); setSelected(null); setNearby([]); setSearchResults([]); setSelectedRoute(null); setQuery(''); setMessage(''); setCenter(africaCenter); setMapZoom(0);
  }

  function chooseSuggestion(id: string) {
    const option = destinationOptions.find((item) => item.id === id);
    if (!option) return;
    setQuery(`${option.name}, ${option.country}`);
    setSearchResults([]);
    setSelectedCountry(option.country);
    const place: PlaceResult = { id: option.id, name: option.name, latitude: option.latitude, longitude: option.longitude, category: 'Ville', address: `${option.region}, ${option.country}`, description: `${option.name}, ${option.country}`, country: option.country };
    void loadNearby(place);
  }

  function chooseSearchResult(place: PlaceResult) {
    setQuery(place.description);
    setMessage('');
    if (place.isCountry) { chooseCountry(place.country ?? place.name, place.latitude, place.longitude); return; }
    void loadNearby(place);
  }

  function confirmTrip() {
    const route = suggestedRoutes.find((item) => item.id === selectedRoute);
    const destination = route ? `${route.stops.join(' → ')}, ${route.country}` : selected ? `${selected.name}, ${selected.country ?? selected.address}` : selectedCountry ?? query;
    router.replace({ pathname: '/create-trip', params: { destination } });
  }

  async function changeCategory(next: string) {
    setCategory(next);
    if (selected) await loadNearby(selected, next);
  }

  const displayName = selected?.name ?? selectedCountry ?? 'Toute l’Afrique';

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}>
        <Header back title="Explorer la carte" right={<Link href="/explore" style={styles.skip}>Explorer</Link>} />
        <AppText style={styles.heading}>{mode === 'outing' ? 'On se retrouve où ?' : mode === 'trip' && !selectedCountry ? 'Dans quel pays ?' : 'Où veux-tu aller ?'}</AppText>
        <AppText style={styles.description}>{mode === 'trip' ? 'Choisis ton pays, puis la ville où tu veux séjourner.' : 'Choisis un lieu, invite tes amis et fixez le rendez-vous ensemble.'}</AppText>

        <View style={styles.modeSwitch}>
          <Pressable onPress={() => { setMode('trip'); setCategory('Culture'); if (selected) void loadNearby(selected, 'Culture'); }} style={[styles.modeButton, mode === 'trip' && styles.modeOn]}><View style={styles.modeLabel}><AppIcon name="trip" size={16} color={mode==='trip'?C.green:C.muted} /><AppText style={[styles.modeText, mode === 'trip' && styles.modeTextOn]}>Voyage</AppText></View></Pressable>
          <Pressable onPress={() => { setMode('outing'); setCategory('Restaurants'); if (selected) void loadNearby(selected, 'Restaurants'); }} style={[styles.modeButton, mode === 'outing' && styles.modeOn]}><View style={styles.modeLabel}><AppIcon name="outing" size={16} color={mode==='outing'?C.green:C.muted} /><AppText style={[styles.modeText, mode === 'outing' && styles.modeTextOn]}>Sortie</AppText></View></Pressable>
        </View>

        <View style={styles.search}>
          <AppIcon name="search" size={18} />
          <AppTextInput value={query} onChangeText={setQuery} onSubmitEditing={() => void submitSearch()} returnKeyType="search" placeholder={mode === 'trip' ? 'Pays ou ville d’Afrique…' : 'Restaurant, ville, quartier…'} placeholderTextColor="#89938A" style={styles.searchInput} />
          <Pressable onPress={() => void submitSearch()} accessibilityRole="button" accessibilityLabel="Rechercher en Afrique"><AppText style={styles.searchAction}>Chercher</AppText></Pressable>
        </View>
        <View style={styles.providerNote}><AppText style={styles.helper}>Recherche et suggestions locales de démonstration · aucune API de lieux.</AppText></View>

        <View style={styles.mapFrame}>
          <MapSurface key={`${center.latitude.toFixed(3)}-${center.longitude.toFixed(3)}-${mapZoom}`} latitude={center.latitude} longitude={center.longitude} zoom={mapZoom} points={visiblePoints} selectedId={selected?.id} onSelect={(point) => { const place = nearby.find((item) => item.id === point.id) ?? searchResults.find((item) => item.id === point.id); const city = destinationOptions.find((item) => item.id === point.id); if (place) chooseSearchResult(place); else if (city) chooseSuggestion(city.id); }} />
          <View pointerEvents="none" style={styles.mapChip}><AppIcon name="globe" size={14} /><AppText style={styles.mapChipText}>{selectedCountry ? selectedCountry.toLocaleUpperCase() : 'AFRIQUE'}</AppText></View>
          <AppText style={styles.mapAttribution}>{Platform.OS === 'web' ? '© OpenStreetMap' : Platform.OS === 'ios' ? 'Plans Apple' : 'Google Maps'}</AppText>
        </View>
        <View style={styles.mapFooter}><View style={{flexDirection:"row",alignItems:"center",gap:5}}><AppIcon name="pin" size={14} /><AppText style={styles.mapPlace}>{displayName}</AppText></View><AppText style={styles.liveTag}>APERÇU CARTE</AppText></View>

        <AppText style={styles.sectionTitle}>{mode === 'trip' ? selectedCountry ? `2. Choisis une ville au ${selectedCountry}` : '1. Choisis ton pays' : 'Qu’est-ce qui te ferait envie ?'}</AppText>
        {mode === 'trip' && !selectedCountry ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
            {countryOptions.map((country) => (
              <Pressable key={country.name} style={styles.destinationChip} onPress={() => chooseCountry(country.name)}>
                <AppIcon name="globe" size={18} /><AppText style={styles.destinationName}>{country.name}</AppText><AppText style={styles.destinationCountry}>Voir les villes →</AppText>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
            {(mode === 'trip' ? countryCities : destinationOptions).map((place) => (
              <Pressable key={place.id} style={styles.destinationChip} onPress={() => chooseSuggestion(place.id)}>
                <AppIcon name={place.emoji} size={18} /><AppText style={styles.destinationName}>{place.name}</AppText><AppText style={styles.destinationCountry}>{mode === 'outing' ? place.country : place.region}</AppText>
              </Pressable>
            ))}
            {mode === 'trip' && countryCities.length === 0 && <AppText style={styles.helper}>Saisis une ville de ce pays dans la recherche ci-dessus.</AppText>}
          </ScrollView>
        )}
        {mode === 'trip' && selectedCountry && <Pressable onPress={clearCountry} style={styles.changeCountry}><AppText style={styles.changeCountryText}>‹ Changer de pays</AppText></Pressable>}

        <>
          <AppText style={styles.sectionTitle}>{mode === 'outing' ? 'Autour du lieu choisi' : 'À voir et à faire autour'}</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map((item) => <Pressable key={item} onPress={() => void changeCategory(item)} style={[styles.categoryChip, category === item && styles.categoryActive]}><AppText style={[styles.categoryText, category === item && styles.categoryTextActive]}>{categoryIcon(item)}  {item}</AppText></Pressable>)}
          </ScrollView>
        </>

        {!!message && <View style={styles.status}><AppText style={styles.statusText}>{busy ? '◌  ' : 'ℹ  '}{message}</AppText>{busy && <ActivityIndicator size="small" color={C.green} />}</View>}

        {!!searchResults.length && <View style={styles.results}>{searchResults.map((place) => <Pressable key={place.id} onPress={() => chooseSearchResult(place)} style={styles.resultRow}><AppText style={styles.resultPin}>⌖</AppText><View style={{ flex: 1 }}><AppText style={styles.resultName}>{place.name}</AppText><AppText style={styles.resultAddress} numberOfLines={2}>{place.description}</AppText></View><AppText style={styles.chevron}>›</AppText></Pressable>)}</View>}

        {!!selected && <Surface style={styles.detailCard}>
          <View style={styles.detailHeading}><View style={styles.detailIcon}><AppIcon name={mode==='outing'?categoryIcon(category):selectedOption?.emoji??'pin'} size={20} /></View><View style={{ flex: 1 }}><AppText style={styles.detailName}>{selected.name}</AppText><AppText style={styles.detailAddress}>{selected.address || selected.category}</AppText></View><AppText style={styles.liveTag}>CARTE</AppText></View>
          {!!selected.description && <AppText style={styles.detailDescription}>{selected.description}</AppText>}
          {nearby.length > 0 && <>
            <AppText style={styles.sectionTitleSmall}>À découvrir près d’ici</AppText>
            {nearby.slice(0, 7).map((place) => <Pressable key={place.id} onPress={() => { setSelected(place); setCenter({ latitude: place.latitude, longitude: place.longitude }); }} style={styles.nearbyRow}><AppIcon name={place.category==='Restaurant'?'restaurant':place.category==='Café'?'coffee':place.category==='Musée'?'culture':categoryIcon(category)} size={18} /><View style={{ flex: 1 }}><AppText style={styles.nearbyName}>{place.name}</AppText><AppText style={styles.nearbyMeta}>{place.category}{place.address ? ` · ${place.address}` : ''}</AppText>{!!place.description && <AppText style={styles.nearbyMeta}>{place.description}</AppText>}</View><AppText style={styles.nearbyChevron}>›</AppText></Pressable>)}
          </>}
        </Surface>}

        {mode === 'outing' && <Surface style={styles.tipCard}><AppText style={styles.tipTitle}>Avant de partir</AppText><AppText style={styles.tipText}>Vérifie les horaires et les avis récents du lieu. Les informations cartographiques peuvent être incomplètes ou changer.</AppText></Surface>}

        {mode === 'trip' && <>
          <View style={styles.adviceCard}><AppIcon name="explore" size={20} /><View style={{ flex: 1 }}><AppText style={styles.adviceTitle}>Conseils pour le pays choisi</AppText><AppText style={styles.adviceText}>Vérifie les zones déconseillées, les formalités d’entrée et les consignes santé auprès des autorités de ton pays. Les avis varient selon ta nationalité et changent régulièrement.</AppText><Link href="https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/" style={styles.sourceLink}>France Diplomatie · Conseils aux voyageurs ↗</Link></View></View>
          {suggestedRoutes.filter((route) => !selectedCountry || route.country === selectedCountry).length > 0 && <><View style={styles.sectionHead}><AppText style={styles.sectionTitle}>{selectedCountry ? `Idées de trajets au ${selectedCountry}` : 'Idées de trajets'}</AppText><AppText style={styles.sectionHint}>DÉMO</AppText></View>
          {suggestedRoutes.filter((route) => !selectedCountry || route.country === selectedCountry).map((route) => <Pressable key={route.id} onPress={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}><Surface style={[styles.routeCard, selectedRoute === route.id && styles.routeSelected]}><View style={[styles.routeEmoji, { backgroundColor: route.tint }]}><AppIcon name={route.emoji} size={22} /></View><View style={{ flex: 1, gap: 4 }}><AppText style={styles.routeName}>{route.name}</AppText><AppText style={styles.routeSubtitle}>{route.subtitle}</AppText><AppText style={styles.routeMeta}>{route.days}  ·  {route.distance}  ·  {route.stops.length} étapes</AppText></View><View style={[styles.radio, selectedRoute === route.id && styles.radioOn]}>{selectedRoute === route.id && <View style={styles.radioDot} />}</View></Surface></Pressable>)}</>}
          <Pressable onPress={confirmTrip} disabled={!selectedCountry && !selected && !selectedRoute} style={[s.button, !selectedCountry && !selected && !selectedRoute && styles.disabledButton]}><AppText style={s.buttonText}>{selectedRoute ? 'Créer ce voyage' : selected ? `Créer un voyage vers ${selected.name}` : selectedCountry ? `Créer un voyage au ${selectedCountry}` : 'Choisis d’abord un pays'}  →</AppText></Pressable>
        </>}

        {mode === 'outing' && <Pressable onPress={() => selected && router.push({ pathname: '/create-outing', params: { place: `${selected.name}, ${selected.country ?? selected.address}`, latitude: String(selected.latitude), longitude: String(selected.longitude) } })} disabled={!selected} style={[s.button, !selected && styles.disabledButton]}><AppText style={s.buttonText}>{selected ? `Inviter des amis à ${selected.name} →` : 'Choisis un lieu pour organiser une sortie'}</AppText></Pressable>}
        <AppText style={styles.disclaimer}>Les lieux, trajets et informations affichés sont des exemples de démonstration.</AppText>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function normalizeCountryName(name: string) { return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim(); }

function categoryIcon(category: string) { return ({ Hébergements: 'apartment', Restaurants: 'restaurant', Culture: 'culture', Nature: 'nature', 'À faire': 'star' })[category] ?? 'pin'; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream }, content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 36, gap: 12, maxWidth: 700, width: '100%', alignSelf: 'center' }, skip: { color: C.green, fontSize: 11, fontWeight: '800' }, heading: { color: C.ink, fontSize: 27, fontWeight: '900', letterSpacing: -0.6 }, description: { color: C.muted, fontSize: 12, marginTop: -9 },
  modeSwitch: { minHeight: 46, borderRadius: 14, padding: 4, backgroundColor: '#EAEDE5', flexDirection: 'row', gap: 3 }, modeButton: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 11 }, modeOn: { backgroundColor: C.white, shadowColor: C.ink, shadowOpacity: .08, shadowRadius: 5, elevation: 2 }, modeLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 }, modeText: { color: C.muted, fontSize: 12, fontWeight: '800' }, modeTextOn: { color: C.green },
  search: { height: 46, borderRadius: 15, backgroundColor: C.white, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.line }, searchIcon: { color: C.green, fontSize: 18 }, searchInput: { color: C.ink, fontSize: 13, flex: 1 }, searchAction: { color: C.green, fontSize: 11, fontWeight: '900' }, helper: { color: C.muted, fontSize: 9, marginLeft: 3, flex: 1 }, providerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5, marginTop: -7 },
  mapFrame: { height: 285, borderRadius: 22, overflow: 'hidden', position: 'relative', backgroundColor: '#D9E7DD' }, mapChip: { position: 'absolute', left: 11, top: 11, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,.94)', borderRadius: 11, paddingHorizontal: 9, paddingVertical: 7 }, mapChipText: { color: C.green, fontWeight: '900', fontSize: 9, letterSpacing: .5 }, mapAttribution: { position: 'absolute', right: 8, bottom: 7, overflow: 'hidden', color: C.green, backgroundColor: 'rgba(255,255,255,.9)', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, fontSize: 8 }, mapFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -7 }, mapPlace: { color: C.ink, fontSize: 11, fontWeight: '800' }, liveTag: { color: C.green, backgroundColor: '#E4EDDF', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4, fontSize: 8, fontWeight: '900', letterSpacing: .4 },
  sectionTitle: { color: C.ink, fontSize: 15, fontWeight: '900', marginTop: 3 }, changeCountry: { alignSelf: 'flex-start', marginTop: -6 }, changeCountryText: { color: C.green, fontSize: 10, fontWeight: '800' }, suggestionRow: { gap: 8, paddingRight: 6 }, destinationChip: { minWidth: 94, minHeight: 72, borderRadius: 14, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, paddingHorizontal: 10, paddingVertical: 8, gap: 3 }, destinationEmoji: { fontSize: 17 }, destinationName: { color: C.ink, fontWeight: '900', fontSize: 11 }, destinationCountry: { color: C.muted, fontSize: 9 }, categoryRow: { gap: 7, paddingRight: 6 }, categoryChip: { minHeight: 44, justifyContent: 'center', borderRadius: 15, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, paddingHorizontal: 11, paddingVertical: 9 }, categoryActive: { backgroundColor: C.green, borderColor: C.green }, categoryText: { color: C.ink, fontSize: 10, fontWeight: '800' }, categoryTextActive: { color: C.white },
  status: { minHeight: 34, borderRadius: 10, backgroundColor: '#EDF2E7', paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, statusText: { color: C.green, fontSize: 10, fontWeight: '700', flex: 1 }, results: { borderRadius: 14, backgroundColor: C.white, paddingHorizontal: 12 }, resultRow: { minHeight: 54, borderBottomWidth: 1, borderBottomColor: C.line, flexDirection: 'row', alignItems: 'center', gap: 10 }, resultPin: { color: C.green, fontSize: 18 }, resultName: { color: C.ink, fontSize: 11, fontWeight: '900' }, resultAddress: { color: C.muted, fontSize: 9, marginTop: 2 }, chevron: { color: C.green, fontSize: 20 },
  detailCard: { gap: 10, padding: 13 }, detailHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 }, detailIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#EFF4E9', justifyContent: 'center', alignItems: 'center' }, detailName: { color: C.ink, fontSize: 13, fontWeight: '900' }, detailAddress: { color: C.muted, fontSize: 9, marginTop: 3 }, detailDescription: { color: C.muted, fontSize: 10, lineHeight: 15 }, sectionTitleSmall: { color: C.ink, fontSize: 11, fontWeight: '900', marginTop: 2 }, nearbyRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, borderTopColor: C.line, paddingVertical: 7 }, nearbyIcon: { fontSize: 17, width: 24, textAlign: 'center' }, nearbyName: { color: C.ink, fontSize: 10, fontWeight: '900' }, nearbyMeta: { color: C.muted, fontSize: 8, marginTop: 2 }, nearbyChevron: { color: C.green, fontSize: 18 },
  tipCard: { backgroundColor: '#EEF3E9', borderRadius: 15, padding: 13, gap: 6 }, tipTitle: { color: C.ink, fontSize: 11, fontWeight: '900' }, tipText: { color: C.muted, fontSize: 10, lineHeight: 15 }, sourceLink: { color: C.green, fontWeight: '900', fontSize: 9, marginTop: 3 }, adviceCard: { backgroundColor: '#F0EFE6', borderRadius: 15, padding: 13, flexDirection: 'row', gap: 10 }, adviceIcon: { fontSize: 20 }, adviceTitle: { color: C.ink, fontWeight: '900', fontSize: 11 }, adviceText: { color: C.muted, fontSize: 10, lineHeight: 14, marginTop: 4 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 }, sectionHint: { color: C.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 }, routeCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 11, borderWidth: 1, borderColor: C.line }, routeSelected: { borderColor: C.green, backgroundColor: '#F2F6ED' }, routeEmoji: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, routeName: { color: C.ink, fontSize: 12, fontWeight: '900' }, routeSubtitle: { color: C.muted, fontSize: 9 }, routeMeta: { color: C.green, fontSize: 9, fontWeight: '800', marginTop: 1 }, radio: { width: 18, height: 18, borderRadius: 10, borderWidth: 1.5, borderColor: '#C9D4C5', alignItems: 'center', justifyContent: 'center' }, radioOn: { borderColor: C.green }, radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.green }, disabledButton: { opacity: .55 }, disclaimer: { color: '#98A299', textAlign: 'center', fontSize: 9, marginTop: -2 },
});
