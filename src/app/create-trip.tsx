import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { useEffect, useState } from 'react';
import { router, Link, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, Share, StyleSheet, View } from 'react-native';
import { C, Header, Page, Surface, s } from '@/components/app-ui';
import { createInvitation, fetchCircles } from '@/actions/groupActions';
import { createTrip as createTripAction, fetchTrips } from '@/actions/tripActions';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import type { CreateTripPayload, NearbyPlaceSuggestion, PlaceSearchRecord } from '@/interface/trips';
import { tripsService } from '@/services/tripsService';

export default function CreateTrip() {
  const params = useLocalSearchParams<{ destination?: string; placeName?: string; latitude?: string; longitude?: string; country?: string; routeStops?: string }>();
  const dispatch = useAppDispatch();
  const { circles } = useAppSelector((state) => state.groups);
  const { requestStatus, error } = useAppSelector((state) => state.trips);
  const initialMapPlace = (() => {
    const latitude = Number(params.latitude);
    const longitude = Number(params.longitude);
    if (!params.placeName || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return {
      id: 'map-selection', name: params.placeName, category: 'Ville',
      description: params.destination ?? params.placeName, address: params.destination ?? params.placeName,
      country: params.country || null, region: null, place_type: 'city', lat: latitude, lng: longitude,
      latitude, longitude, emoji: null, isCountry: false,
    } satisfies PlaceSearchRecord;
  })();
  const [name, setName] = useState('');
  const [place, setPlace] = useState(typeof params.destination === 'string' ? params.destination : '');
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchRecord | null>(initialMapPlace);
  const [citySuggestions, setCitySuggestions] = useState<PlaceSearchRecord[]>([]);
  const [placeSearchLoading, setPlaceSearchLoading] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState('');
  const [restaurantSuggestions, setRestaurantSuggestions] = useState<NearbyPlaceSuggestion[]>([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [restaurantError, setRestaurantError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [plannedBudget, setPlannedBudget] = useState('');
  const [step, setStep] = useState(1);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [inviteError, setInviteError] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [circleId, setCircleId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const [query, ...countryParts] = place.split(',');
    const searchTerm = query.trim();
    const country = countryParts.join(',').trim() || undefined;
    let active = true;
    const timer = setTimeout(async () => {
      if (searchTerm.length < 2 || (selectedPlace && selectedPlace.name.toLocaleLowerCase() === searchTerm.toLocaleLowerCase())) {
        setCitySuggestions([]);
        setPlaceSearchLoading(false);
        return;
      }
      setPlaceSearchLoading(true);
      setPlaceSearchError('');
      try {
        const results = await tripsService.searchPlaces(searchTerm, country);
        if (active) setCitySuggestions(results);
      } catch {
        if (active) {
          setCitySuggestions([]);
          setPlaceSearchError('La recherche de destinations via l’API est momentanément indisponible.');
        }
      } finally {
        if (active) setPlaceSearchLoading(false);
      }
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [place, selectedPlace]);

  useEffect(() => {
    void dispatch(fetchCircles());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedPlace) return;
    let active = true;
    const timer = setTimeout(async () => {
      const latitude = selectedPlace.latitude ?? selectedPlace.lat;
      const longitude = selectedPlace.longitude ?? selectedPlace.lng;
      if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
        setRestaurantError('Cette destination ne contient pas de coordonnées; les restaurants proches ne sont pas disponibles.');
        return;
      }
      setRestaurantLoading(true);
      try {
        const results = await tripsService.fetchNearbyPlaces(latitude, longitude, 'Restaurants', selectedPlace.name);
        if (active) setRestaurantSuggestions(results);
      } catch {
        if (active) setRestaurantError('Les restaurants de cette ville n’ont pas pu être chargés depuis l’API.');
      } finally {
        if (active) setRestaurantLoading(false);
      }
    }, 0);
    return () => { active = false; clearTimeout(timer); };
  }, [selectedPlace]);

  async function chooseDestination(suggestion: PlaceSearchRecord) {
    setSelectedPlace(suggestion);
    setPlace(`${suggestion.name}${suggestion.country ? `, ${suggestion.country}` : ''}`);
    setCitySuggestions([]);
    setRestaurantSuggestions([]);
    setSelectedRestaurants([]);
    setRestaurantError('');
  }

  function toggleRestaurant(id: string) {
    setSelectedRestaurants((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function addInvite() {
    const email = inviteEmail.trim().toLocaleLowerCase();
    if (!email.includes('@') || !email.split('@')[1]?.includes('.')) { setInviteError('Entre une adresse e-mail valide.'); return; }
    if (invitedEmails.includes(email)) { setInviteError('Cette personne est déjà dans la liste.'); return; }
    setInvitedEmails((old) => [...old, email]); setInviteEmail(''); setInviteError('Adresse ajoutée à la liste d’invitations.');
  }

  async function next() {
    if (step === 1 && !name.trim()) {
      Alert.alert('Ajoute un nom', 'Donne un nom à votre voyage pour continuer.');
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }

    const circle = circles.find((item) => item.id === circleId);
    const destination = place.trim() || (typeof params.destination === 'string' ? params.destination : 'Destination à choisir');
    const tripTitle = name.trim() || `Voyage à ${destination}`;
    const budget = plannedBudget.trim() ? Number(plannedBudget.replace(/\s/g, '')) : undefined;
    if (budget !== undefined && (!Number.isInteger(budget) || budget < 0)) {
      setInviteError('Le budget doit être un montant entier en FCFA.');
      return;
    }
    const payload: CreateTripPayload = {
      name: tripTitle,
      destination_label: destination,
      ...(circle?.id ? { circle_id: circle.id } : {}),
      member_names: circle?.members ?? [],
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
      ...(startDate && endDate ? { display_dates: `${startDate} — ${endDate}` } : {}),
      currency: 'XOF',
      ...(budget !== undefined ? { planned_budget: budget } : {}),
      estimated_members: Math.max(1, circle?.members.length ?? 1),
      visibility: isPrivate ? 'private' : 'public',
    };

    setIsSaving(true);
    setInviteError('');
    try {
      const trip = await dispatch(createTripAction(payload)).unwrap();
      if (selectedPlace || typeof params.routeStops === 'string') {
        try {
          let routeStops: string[] = [];
          if (typeof params.routeStops === 'string') {
            try { routeStops = JSON.parse(params.routeStops) as string[]; } catch { routeStops = []; }
          }
          const stopNames = routeStops.length ? routeStops : selectedPlace ? [selectedPlace.name] : [];
          const stops = await Promise.all(stopNames.map(async (name, position) => {
            const match = selectedPlace?.name === name ? selectedPlace : (await tripsService.searchPlaces(name, typeof params.country === 'string' ? params.country : undefined)).find((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase());
            return tripsService.createTripPlace({
              trip_id: trip.id,
              city: match?.name ?? name,
              country: match?.country ?? (typeof params.country === 'string' ? params.country : undefined),
              ...(match?.id ? { place_id: match.id } : {}),
              position,
            });
          }));
          if (selectedPlace && selectedRestaurants.length && stops[0]) {
            await Promise.all(restaurantSuggestions
              .filter((suggestion) => selectedRestaurants.includes(suggestion.id))
              .map((suggestion) => tripsService.createActivity({
                trip_id: trip.id,
                trip_place_id: stops[0].id,
                title: suggestion.name,
                description: suggestion.description,
                category: suggestion.category,
                location_label: suggestion.address,
              })));
          }
        } catch {
          setInviteError('Le voyage est créé, mais une ou plusieurs étapes API n’ont pas pu être ajoutées à son itinéraire.');
        }
      }
      const inviteLinks: string[] = [];
      for (const email of invitedEmails) {
        try {
          const invitation = await dispatch(createInvitation({
            trip_id: trip.id,
            channel: 'email',
            target: email,
          })).unwrap();
          if (invitation.email_sent === false && invitation.invite_url) inviteLinks.push(`Courriel non envoyé à ${email}. Lien : ${invitation.invite_url}`);
        } catch {
          setInviteError(`Le voyage est créé, mais une invitation pour ${email} n’a pas été enregistrée.`);
        }
      }
      if (inviteLinks.length) {
        try {
          await Share.share({ message: inviteLinks.join('\n') });
        } catch {
          setInviteError(`Voyage créé. Partage les liens : ${inviteLinks.join(' ')}`);
        }
      }
      await dispatch(fetchTrips());
      router.replace({ pathname: '/trip/[id]', params: { id: trip.id } } as never);
    } catch {
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header back title="Créer un voyage" />
        <View style={st.progress}>
          <View style={[st.segment, st.on]} /><View style={[st.segment, step >= 2 && st.on]} />
          <AppText style={{ fontSize: 10, color: C.muted, marginLeft: 4 }}>Étape {step} sur 2</AppText>
        </View>
        <AppText style={st.title}>{step === 1 ? 'Une nouvelle aventure.' : 'Qui vient avec toi ?'}</AppText>
        <AppText style={st.subtitle}>{step === 1 ? 'Commençons par rêver un peu.' : 'Les meilleurs voyages se partagent.'}</AppText>
        {step === 1 ? <>
          <AppText style={st.label}>COMMENT ON L’APPELLE ?</AppText>
          <AppTextInput value={name} onChangeText={setName} placeholder="Ex. Notre été au Bénin" style={s.input} />
          <AppText style={st.label}>PAYS ET DESTINATION</AppText>
          <View style={st.destinationRow}>
            <AppTextInput value={place} onChangeText={(value) => {
              setPlace(value);
              setSelectedPlace(null);
              setCitySuggestions([]);
              setRestaurantSuggestions([]);
              setSelectedRestaurants([]);
              setRestaurantError('');
            }} placeholder="Ville, pays ou destination" style={[s.input, { flex: 1 }]} />
            <Link href="/map?returnTo=create-trip" asChild>
              <Pressable style={st.mapButton}><AppText style={{ fontSize: 18 }}>⌖</AppText><AppText style={st.mapButtonText}>Carte</AppText></Pressable>
            </Link>
          </View>
          {placeSearchLoading && <AppText style={st.footnote}>Recherche de villes dans l’API…</AppText>}
          {!!placeSearchError && <AppText style={[st.footnote, { color: '#A7493C' }]}>{placeSearchError}</AppText>}
          {citySuggestions.map((suggestion) => (
            <Pressable key={suggestion.id} onPress={() => void chooseDestination(suggestion)}>
              <Surface style={st.placeSuggestion}>
                <AppIcon name={suggestion.emoji || 'pin'} size={20} />
                <View style={{ flex: 1 }}>
                  <AppText style={st.suggestionTitle}>{suggestion.name}</AppText>
                  <AppText style={st.footnote}>{[suggestion.region, suggestion.country, suggestion.address].filter(Boolean).join(' · ')}</AppText>
                </View>
                <AppText style={st.mapButtonText}>Choisir</AppText>
              </Surface>
            </Pressable>
          ))}
          {citySuggestions.some((suggestion) => suggestion.source === 'Geoapify') && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Link href="https://www.geoapify.com/" style={st.footnote}>Powered by Geoapify</Link><AppText style={st.footnote}>· © OpenStreetMap contributors</AppText></View>}
          {!selectedPlace && place.trim().length >= 2 && !placeSearchLoading && !placeSearchError && citySuggestions.length === 0 && <AppText style={st.footnote}>Aucun lieu correspondant dans le catalogue API. Tu peux garder cette destination ou en choisir une sur la carte.</AppText>}
          {selectedPlace && <Surface style={st.restaurantPanel}>
            <AppText style={st.suggestionTitle}>Restaurants près de {selectedPlace.name}</AppText>
            <AppText style={st.footnote}>{restaurantSuggestions[0]?.source === 'Geoapify' ? 'Suggestions Geoapify, à confirmer sur place. Les horaires et l’ouverture peuvent changer.' : 'Établissements référencés dans OpenStreetMap, à confirmer sur place. Les horaires et l’ouverture peuvent changer.'}</AppText>
            {restaurantLoading && <AppText style={st.footnote}>Chargement des restaurants…</AppText>}
            {!!restaurantError && <AppText style={[st.footnote, { color: '#A7493C' }]}>{restaurantError}</AppText>}
            {restaurantSuggestions.map((suggestion) => {
              const chosen = selectedRestaurants.includes(suggestion.id);
              return <Pressable key={suggestion.id} onPress={() => toggleRestaurant(suggestion.id)}>
                <Surface style={[st.restaurantSuggestion, chosen && st.restaurantSelected]}>
                  <AppIcon name={suggestion.category.toLowerCase().includes('café') ? 'coffee' : 'restaurant'} size={19} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <AppText style={st.suggestionTitle}>{suggestion.name}</AppText>
                    <AppText style={st.footnote}>{suggestion.description}</AppText>
                    <AppText style={st.footnote}>{suggestion.address}</AppText>
                    <AppText style={st.footnote}>Source : {suggestion.source} · fiche non vérifiée sur place</AppText>
                  </View>
                  <AppText style={st.mapButtonText}>{chosen ? '✓ Ajouté' : 'Ajouter'}</AppText>
                </Surface>
              </Pressable>;
            })}
            {!restaurantLoading && !restaurantError && restaurantSuggestions.length === 0 && <AppText style={st.footnote}>Aucun restaurant proposé par l’API autour de cette ville.</AppText>}
            {!!restaurantSuggestions.length && (restaurantSuggestions[0]?.source === 'Geoapify' ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Link href="https://www.geoapify.com/" style={st.footnote}>Powered by Geoapify</Link><AppText style={st.footnote}>· © OpenStreetMap contributors</AppText></View> : <AppText style={st.footnote}>© OpenStreetMap contributors · Données sous licence ODbL</AppText>)}
          </Surface>}
          <AppText style={st.label}>DATES DU VOYAGE</AppText>
          <View style={{ flexDirection: 'row', gap: 10 }}><AppTextInput value={startDate} onChangeText={setStartDate} placeholder="Départ · AAAA-MM-JJ" style={[s.input, { flex: 1 }]} /><AppTextInput value={endDate} onChangeText={setEndDate} placeholder="Retour · AAAA-MM-JJ" style={[s.input, { flex: 1 }]} /></View>
          <AppText style={st.label}>BUDGET PAR PERSONNE</AppText>
          <AppTextInput value={plannedBudget} onChangeText={setPlannedBudget} keyboardType="numeric" placeholder="Ex. 200 000 FCFA" style={s.input} />
          <Pressable onPress={() => setIsPrivate((old) => !old)}><Surface style={st.privacy}><AppIcon name="lock" size={18} /><View style={{ flex: 1 }}><AppText style={st.privacyTitle}>{isPrivate ? 'Voyage privé' : 'Voyage public'}</AppText><AppText style={st.privacyText}>{isPrivate ? 'Seuls les membres invités pourront le voir.' : 'Le voyage apparaîtra dans la découverte publique.'}</AppText></View><AppText style={{ color: C.green, fontWeight: '800' }}>⌄</AppText></Surface></Pressable>
        </> : <>
          <Surface style={st.invite}>
            <AppIcon name="group" size={34} /><AppText style={st.inviteTitle}>Ça se prépare en équipe.</AppText>
            <AppText style={st.inviteBody}>Tu pourras inviter tes amis, proposer des idées et décider ensemble de chaque étape.</AppText>
          </Surface>
          <AppText style={st.label}>CHOISIR UN CERCLE</AppText>
          <View style={st.chips}>
            <Pressable onPress={() => setCircleId('')} style={[st.memberChip, !circleId && st.memberChipOn]}><AppText style={[st.memberText, !circleId && st.memberTextOn]}>Sans cercle</AppText></Pressable>
            {circles.map((circle) => <Pressable key={circle.id} onPress={() => setCircleId(circle.id)} style={[st.memberChip, circleId === circle.id && st.memberChipOn]}><AppText style={[st.memberText, circleId === circle.id && st.memberTextOn]}>{circle.name}</AppText></Pressable>)}
          </View>
          {!!circleId && <AppText style={st.footnote}>{circles.find((circle) => circle.id === circleId)?.members.length ?? 0} nom(s) dans ce cercle; les comptes existants seront ajoutés comme membres du voyage.</AppText>}
          {!circles.length && <AppText style={st.footnote}>Crée d’abord un cercle dans « Mon cercle d’amis » pour l’associer au voyage.</AppText>}
          <AppText style={st.label}>INVITER PAR E-MAIL</AppText><View style={st.destinationRow}><AppTextInput value={inviteEmail} onChangeText={setInviteEmail} placeholder="ami@exemple.com" keyboardType="email-address" autoCapitalize="none" style={[s.input,{flex:1}]} /><Pressable onPress={addInvite} style={st.mapButton}><AppText style={st.mapButtonText}>Ajouter</AppText></Pressable></View>
          {!!inviteError && <AppText style={st.footnote}>{inviteError}</AppText>}
          {invitedEmails.map((email) => <Surface key={email} style={st.invited}><AppIcon name="profile" size={17} /><AppText style={{flex:1,color:C.ink,fontSize:11}}>{email}</AppText><Pressable onPress={() => setInvitedEmails((old) => old.filter((item) => item !== email))}><AppText style={st.mapButtonText}>Retirer</AppText></Pressable></Surface>)}
          <AppText style={st.footnote}>Les invitations sont enregistrées et leurs liens seront proposés au partage; le backend n’envoie pas les e-mails.</AppText>
        </>}
        {!!inviteError && <AppText style={[st.footnote, { color: '#A7493C' }]}>{inviteError}</AppText>}
        {!!error && <AppText style={[st.footnote, { color: '#A7493C' }]}>{error}</AppText>}
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => void next()} disabled={isSaving || requestStatus === 'loading'} style={[s.button, (isSaving || requestStatus === 'loading') && { opacity: 0.6 }]}><AppText style={s.buttonText}>{step === 1 ? 'Continuer  →' : isSaving ? 'Création…' : 'Créer mon voyage'}</AppText></Pressable>
      </Page>
    </View>
  );
}

const st = StyleSheet.create({
  progress: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }, segment: { height: 5, width: 48, borderRadius: 5, backgroundColor: '#E3E8DE' }, on: { backgroundColor: C.green },
  title: { fontSize: 29, fontWeight: '900', color: C.ink, lineHeight: 35 }, subtitle: { fontSize: 13, color: C.muted, marginTop: -12 }, label: { fontSize: 10, fontWeight: '900', color: C.muted, letterSpacing: 1.1, marginTop: 4 },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F0F4E8' }, privacyTitle: { fontSize: 12, fontWeight: '800', color: C.ink }, privacyText: { fontSize: 10, color: C.muted, marginTop: 3 }, invite: { alignItems: 'center', padding: 25 }, inviteTitle: { fontSize: 17, fontWeight: '900', color: C.ink, marginTop: 12 }, inviteBody: { fontSize: 12, lineHeight: 19, color: C.muted, textAlign: 'center', marginTop: 5 }, inviteButton: { padding: 10 },
  placeSuggestion: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 }, restaurantPanel: { gap: 9, backgroundColor: '#F5F6F1' }, restaurantSuggestion: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderWidth: 1, borderColor: C.line }, restaurantSelected: { borderColor: C.green, backgroundColor: '#EAF1E4' }, suggestionTitle: { fontSize: 11, fontWeight: '900', color: C.ink }, apiNotice: { fontSize: 9, lineHeight: 14, color: C.muted, fontStyle: 'italic' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, memberChip: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 13, backgroundColor: '#F5F6F1', borderWidth: 1, borderColor: C.line }, memberChipOn: { backgroundColor: C.green, borderColor: C.green }, memberText: { fontSize: 10, color: C.ink, fontWeight: '800' }, memberTextOn: { color: C.white }, destinationRow: { flexDirection: 'row', gap: 8, alignItems: 'center' }, mapButton: { height: 48, minWidth: 60, borderRadius: 14, backgroundColor: '#EAF1E4', alignItems: 'center', justifyContent: 'center', gap: 1 }, mapButtonText: { fontSize: 10, fontWeight: '800', color: C.green }, invited: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 10 }, footnote: { textAlign: 'center', fontSize: 10, color: C.muted },
});
