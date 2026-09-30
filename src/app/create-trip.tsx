import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { useState } from 'react';
import { router, Link, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { C, Header, Page, Surface, s } from '@/components/app-ui';
import { createTrip } from '@/data/mock';
import { listCircles, suggestedFriends } from '@/data/circles';

export default function CreateTrip() {
  const params = useLocalSearchParams<{ destination?: string }>();
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [step, setStep] = useState(1);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [inviteError, setInviteError] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const circles = listCircles();
  const [circleId, setCircleId] = useState(circles[0]?.id ?? '');
  const [selectedFriends, setSelectedFriends] = useState<string[]>(circles[0]?.members.filter((member) => member !== 'Toi') ?? ['Amadou', 'Mariam']);

  function addInvite() {
    const email = inviteEmail.trim().toLocaleLowerCase();
    if (!email.includes('@') || !email.split('@')[1]?.includes('.')) { setInviteError('Entre une adresse e-mail valide.'); return; }
    if (invitedEmails.includes(email)) { setInviteError('Cette personne est déjà dans la liste.'); return; }
    setInvitedEmails((old) => [...old, email]); setInviteEmail(''); setInviteError('Invitation ajoutée à la démo ✓');
  }

  function next() {
    if (step === 1 && !name.trim()) {
      Alert.alert('Ajoute un nom', 'Donne un nom à votre voyage pour continuer.');
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }

    const destination = place.trim() || (typeof params.destination === 'string' ? params.destination : 'Destination à choisir');
    const tripTitle = name.trim() || `Voyage à ${destination}`;
    const circle = circles.find((item) => item.id === circleId);
    const trip = createTrip({ title: tripTitle, destination, members: ['Toi', ...selectedFriends], circleName: circle?.name });
    router.replace({ pathname: '/trip/[id]', params: { id: trip.id } });
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
            <AppTextInput value={place || (typeof params.destination === 'string' ? params.destination : '')} onChangeText={setPlace} placeholder="Choisis d’abord un pays" style={[s.input, { flex: 1 }]} />
            <Link href="/map?returnTo=create-trip" asChild>
              <Pressable style={st.mapButton}><AppText style={{ fontSize: 18 }}>⌖</AppText><AppText style={st.mapButtonText}>Carte</AppText></Pressable>
            </Link>
          </View>
          <AppText style={st.label}>DATES DU VOYAGE</AppText>
          <View style={{ flexDirection: 'row', gap: 10 }}><AppTextInput placeholder="Date de départ" style={[s.input, { flex: 1 }]} /><AppTextInput placeholder="Date de retour" style={[s.input, { flex: 1 }]} /></View>
          <AppText style={st.label}>BUDGET PAR PERSONNE</AppText>
          <AppTextInput keyboardType="numeric" placeholder="Ex. 200 000 FCFA" style={s.input} />
          <Pressable onPress={() => setIsPrivate((old) => !old)}><Surface style={st.privacy}><AppIcon name="lock" size={18} /><View style={{ flex: 1 }}><AppText style={st.privacyTitle}>{isPrivate ? 'Voyage privé' : 'Voyage de groupe'}</AppText><AppText style={st.privacyText}>{isPrivate ? 'Seules les personnes invitées pourront le voir.' : 'Le voyage sera visible par ton groupe de démonstration.'}</AppText></View><AppText style={{ color: C.green, fontWeight: '800' }}>⌄</AppText></Surface></Pressable>
        </> : <>
          <Surface style={st.invite}>
            <AppIcon name="group" size={34} /><AppText style={st.inviteTitle}>Ça se prépare en équipe.</AppText>
            <AppText style={st.inviteBody}>Tu pourras inviter tes amis, proposer des idées et décider ensemble de chaque étape.</AppText>
          </Surface>
          <AppText style={st.label}>CHOISIR UN CERCLE</AppText>
          <View style={st.chips}>
            <Pressable onPress={() => { setCircleId(''); setSelectedFriends(['Amadou', 'Mariam']); }} style={[st.memberChip, !circleId && st.memberChipOn]}><AppText style={[st.memberText, !circleId && st.memberTextOn]}>Choisir des amis</AppText></Pressable>
            {circles.map((circle) => <Pressable key={circle.id} onPress={() => { setCircleId(circle.id); setSelectedFriends(circle.members.filter((member) => member !== 'Toi')); }} style={[st.memberChip, circleId === circle.id && st.memberChipOn]}><AppText style={[st.memberText, circleId === circle.id && st.memberTextOn]}>{circle.name}</AppText></Pressable>)}
          </View>
          <AppText style={st.label}>QUI VIENT ?</AppText>
          <View style={st.chips}>{[...new Set([...suggestedFriends, ...circles.flatMap((circle) => circle.members)])].filter((member) => member !== 'Toi').map((member) => { const active = selectedFriends.includes(member); return <Pressable key={member} onPress={() => setSelectedFriends((old) => active ? old.filter((item) => item !== member) : [...old, member])} style={[st.memberChip, active && st.memberChipOn]}><AppText style={[st.memberText, active && st.memberTextOn]}>{active ? '✓  ' : '+  '}{member}</AppText></Pressable>; })}</View>
          <AppText style={st.footnote}>{selectedFriends.length} ami(s) sélectionné(s) · tu peux modifier les membres du cercle pour ce voyage.</AppText>
          <AppText style={st.label}>INVITER PAR E-MAIL</AppText><View style={st.destinationRow}><AppTextInput value={inviteEmail} onChangeText={setInviteEmail} placeholder="ami@exemple.com" keyboardType="email-address" autoCapitalize="none" style={[s.input,{flex:1}]} /><Pressable onPress={addInvite} style={st.mapButton}><AppText style={st.mapButtonText}>Ajouter</AppText></Pressable></View>
          {!!inviteError && <AppText style={st.footnote}>{inviteError}</AppText>}
          {invitedEmails.map((email) => <Surface key={email} style={st.invited}><AppIcon name="profile" size={17} /><AppText style={{flex:1,color:C.ink,fontSize:11}}>{email}</AppText><Pressable onPress={() => setInvitedEmails((old) => old.filter((item) => item !== email))}><AppText style={st.mapButtonText}>Retirer</AppText></Pressable></Surface>)}
          <AppText style={st.footnote}>Les invitations sont simulées, aucun e-mail n’est envoyé.</AppText>
        </>}
        <View style={{ flex: 1 }} />
        <Pressable onPress={next} style={s.button}><AppText style={s.buttonText}>{step === 1 ? 'Continuer  →' : 'Créer mon voyage'}</AppText></Pressable>
        <AppText style={st.footnote}>Mode aperçu · les données ne sont pas envoyées</AppText>
      </Page>
    </View>
  );
}

const st = StyleSheet.create({
  progress: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }, segment: { height: 5, width: 48, borderRadius: 5, backgroundColor: '#E3E8DE' }, on: { backgroundColor: C.green },
  title: { fontSize: 29, fontWeight: '900', color: C.ink, lineHeight: 35 }, subtitle: { fontSize: 13, color: C.muted, marginTop: -12 }, label: { fontSize: 10, fontWeight: '900', color: C.muted, letterSpacing: 1.1, marginTop: 4 },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F0F4E8' }, privacyTitle: { fontSize: 12, fontWeight: '800', color: C.ink }, privacyText: { fontSize: 10, color: C.muted, marginTop: 3 }, invite: { alignItems: 'center', padding: 25 }, inviteTitle: { fontSize: 17, fontWeight: '900', color: C.ink, marginTop: 12 }, inviteBody: { fontSize: 12, lineHeight: 19, color: C.muted, textAlign: 'center', marginTop: 5 }, inviteButton: { padding: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, memberChip: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 13, backgroundColor: '#F5F6F1', borderWidth: 1, borderColor: C.line }, memberChipOn: { backgroundColor: C.green, borderColor: C.green }, memberText: { fontSize: 10, color: C.ink, fontWeight: '800' }, memberTextOn: { color: C.white }, destinationRow: { flexDirection: 'row', gap: 8, alignItems: 'center' }, mapButton: { height: 48, minWidth: 60, borderRadius: 14, backgroundColor: '#EAF1E4', alignItems: 'center', justifyContent: 'center', gap: 1 }, mapButtonText: { fontSize: 10, fontWeight: '800', color: C.green }, invited: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 10 }, footnote: { textAlign: 'center', fontSize: 10, color: C.muted },
});
