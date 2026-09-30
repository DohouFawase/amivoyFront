import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { useMemo, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { C, Header, Page, SectionTitle, Surface } from '@/components/app-ui';
import { trips } from '@/data/mock';
import { addTripPlanItem, listTripPlanItems, removeTripPlanItem } from '@/data/trip-plan';

type Offer = { id: string; kind: string; name: string; district: string; description: string; price: string; icon: string; time: string; detail: string };
const filters = ['Tout', 'Hébergement', 'Restaurant', 'Activité', 'Transport'];
function makeOffers(destination: string): Offer[] {
  const city = destination.split(/[→,]/)[0]?.trim() || 'ta destination';
  const money = 'XOF';
  const lodgingPrices = ['18 000','24 000','32 000','45 000'];
  const mealPrices = ['4 500','6 000','8 500','12 000'];
  const all: Offer[] = [
    ...[
      ['Appartement lumineux', 'Centre-ville', '2 voyageurs · Wi-Fi · cuisine équipée', '🏢'],
      ['Studio des voyageurs', 'Quartier calme', '2 voyageurs · climatisation · kitchenette', '🛏️'],
      ['Résidence des Palmiers', 'À 10 min du centre', '4 voyageurs · terrasse · parking', '🌴'],
      ['Maison avec terrasse', 'Quartier résidentiel', '6 voyageurs · 3 chambres · cuisine', '🏡'],
    ].map(([name,area,description,icon],i)=>({id:`stay-${i}`,kind:'Hébergement',name:`${name} · ${city}`,district:`${area}, ${city}`,description,price:`${lodgingPrices[i]} ${money} / nuit`,icon,time:'15:00',detail:'Logement de démonstration · disponibilité et conditions à confirmer.'})),
    ...[
      ['La table du marché','Cuisine locale · plats à partager','🍲'],
      ['Terrasse des voyageurs','Cuisine du monde · terrasse','🍽️'],
      ['Chez Awa','Spécialités maison · ambiance conviviale','🥘'],
      ['Café du quartier','Petit-déjeuner · café · goûter','☕'],
    ].map(([name,description,icon],i)=>({id:`restaurant-${i}`,kind:'Restaurant',name:`${name} · ${city}`,district:`Centre-ville, ${city}`,description,price:`${mealPrices[i]} ${money} / personne`,icon,time:i===3?'10:00':'19:30',detail:'Adresse et horaires fictifs pour la maquette. Pense à confirmer la réservation.'})),
    {id:'activity-0',kind:'Activité',name:`Visite guidée de ${city}`,district:`Départ du centre, ${city}`,description:'Guide local · patrimoine et bonnes adresses',price:'Dès 8 000 XOF / personne',icon:'🧭',time:'10:00',detail:'Activité de démonstration à ajouter à une journée de ton programme.'},
    {id:'activity-1',kind:'Activité',name:`Découverte des saveurs de ${city}`,district:`Marché central, ${city}`,description:'Dégustation et rencontre avec les artisans',price:'Dès 6 000 XOF / personne',icon:'🧺',time:'11:00',detail:'Activité de démonstration à ajouter à une journée de ton programme.'},
    {id:'transport-0',kind:'Transport',name:`Transfert à ${city}`,district:'Aéroport / gare → hébergement',description:'Chauffeur local · véhicule climatisé',price:'Dès 12 000 XOF',icon:'🚙',time:'08:00',detail:'Transport fictif · horaires et tarifs à confirmer.'},
  ];
  return all;
}
export default function Services() {
  const { id, destination } = useLocalSearchParams<{id:string;destination?:string}>();
  const trip = trips.find((item) => item.id === id);
  const city = typeof destination === 'string' ? destination : trip?.destination ?? 'Destination à choisir';
  const offers = useMemo(() => makeOffers(city), [city]);
  const [filter,setFilter]=useState('Tout');
  const [expanded,setExpanded]=useState<string|null>(null);
  const [refresh,setRefresh]=useState(0);
  const planned=listTripPlanItems(id);
  const visible=filter==='Tout'?offers:offers.filter((offer)=>offer.kind===filter);
  function togglePlan(offer:Offer){
    const planId=`${id}-${offer.id}`;
    if(planned.some((item)=>item.id===planId))removeTripPlanItem(planId);
    else addTripPlanItem({id:planId,tripId:id,title:offer.name,type:offer.kind,location:offer.district,time:offer.time,description:offer.price,emoji:offer.icon});
    setRefresh(refresh+1);
  }
  void refresh;
  return <Page>
    <Header back title="Logements et bonnes adresses" />
    <AppText style={st.heading}>Trouvons les bonnes adresses.</AppText>
    <AppText style={st.sub}>Sélection mock pour {city}. Choisis un logement, un restaurant ou une activité pour compléter le programme.</AppText>
    <View style={st.filters}>{filters.map((item)=><Pressable key={item} onPress={()=>setFilter(item)} style={[st.filter,filter===item&&st.filterOn]}><AppText style={[st.filterText,filter===item&&st.filterTextOn]}>{item}</AppText></Pressable>)}</View>
    {filter==='Hébergement'&&<Surface style={st.tip}><AppText style={st.tipTitle}>Appartements et hébergements à {city}</AppText><AppText style={st.sub}>Compare la capacité, le quartier et les équipements. Les offres ci-dessous sont fictives.</AppText></Surface>}
    {filter==='Restaurant'&&<Surface style={st.tip}><AppText style={st.tipTitle}>Restaurants à {city}</AppText><AppText style={st.sub}>Choisis une adresse pour l’ajouter au programme du voyage.</AppText></Surface>}
    <SectionTitle title={filter==='Tout'?'Suggestions pour cette destination':`${filter}s à ${city}`} action={`${visible.length} idées`} />
    {visible.map((offer)=>{
      const planId=`${id}-${offer.id}`;
      const isPlanned=planned.some((item)=>item.id===planId);
      return <Surface key={offer.id} style={st.card}>
        <Pressable onPress={()=>setExpanded(expanded===offer.id?null:offer.id)} style={st.top}>
          <AppIcon name={offer.icon} size={25} /><View style={{flex:1}}><AppText style={st.kind}>{offer.kind.toUpperCase()}</AppText><AppText style={st.name}>{offer.name}</AppText></View><AppText style={st.rating}>★ 4,8</AppText>
        </Pressable>
        <AppText style={st.district}>⌖  {offer.district}</AppText><AppText style={st.sub}>{offer.description}</AppText>
        {expanded===offer.id&&<View style={st.details}><AppText style={st.detailText}>{offer.detail}</AppText><AppText style={st.detailText}>Prix indicatif : {offer.price}</AppText><AppText style={st.detailText}>Étape proposée à {offer.time}</AppText></View>}
        <View style={st.bottom}><AppText style={st.price}>{offer.price}</AppText><Pressable onPress={()=>togglePlan(offer)} style={[st.button,isPlanned&&st.buttonOn]}><AppText style={[st.buttonText,isPlanned&&st.buttonTextOn]}>{isPlanned?'Dans le programme ✓':'Ajouter au programme'}</AppText></Pressable></View>
      </Surface>;
    })}
    <Surface style={st.notice}><AppText style={st.noticeTitle}>Programme du voyage · {planned.length} choix</AppText><AppText style={st.sub}>{planned.length?planned.map((item)=>item.title).join(' · '):'Ajoute des logements et restaurants ; ils apparaîtront dans ton itinéraire.'}</AppText><Link href={{pathname:'/trip/[id]/itinerary',params:{id}} as any} style={st.link}>Voir l’itinéraire complet →</Link></Surface>
    <AppText style={st.foot}>Catalogue de démonstration : offres, prix, disponibilités et avis fictifs. Aucune réservation réelle.</AppText>
  </Page>;
}
const st=StyleSheet.create({heading:{fontSize:26,fontWeight:'900',color:C.ink,lineHeight:32},sub:{fontSize:11,color:C.muted,lineHeight:16},filters:{flexDirection:'row',gap:7,flexWrap:'wrap'},filter:{minHeight:44,justifyContent:"center",paddingHorizontal:10,paddingVertical:8,borderRadius:15,backgroundColor:C.white},filterOn:{backgroundColor:C.green},filterText:{fontSize:9,fontWeight:'800',color:C.muted},filterTextOn:{color:C.white},tip:{gap:5,backgroundColor:'#EEF3E9'},tipTitle:{fontSize:12,fontWeight:'900',color:C.ink},card:{gap:8,padding:13},top:{flexDirection:'row',alignItems:'center',gap:10},icon:{fontSize:25,width:37},kind:{fontSize:8,fontWeight:'900',letterSpacing:1,color:C.green},name:{fontSize:12,fontWeight:'900',color:C.ink,marginTop:3},rating:{fontSize:10,color:'#B88132',fontWeight:'900'},district:{fontSize:9,color:C.green,fontWeight:'800'},bottom:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:6,marginTop:3},price:{fontSize:10,fontWeight:'900',color:C.ink,flex:1},button:{backgroundColor:'#EDF2E7',paddingHorizontal:9,paddingVertical:9,borderRadius:10},buttonOn:{backgroundColor:C.green},buttonText:{fontSize:9,color:C.green,fontWeight:'900'},buttonTextOn:{color:C.white},details:{gap:4,padding:10,borderRadius:11,backgroundColor:'#F6F7F2'},detailText:{fontSize:9,color:C.muted,lineHeight:14},notice:{gap:6,backgroundColor:'#EEF3E9'},noticeTitle:{fontSize:12,fontWeight:'900',color:C.ink},link:{color:C.green,fontSize:10,fontWeight:'900'},foot:{fontSize:9,color:C.muted,textAlign:'center',lineHeight:14}});
