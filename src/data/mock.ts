import { recordGroupActivity } from "@/data/group-activity";
export type Trip = { id:string; title:string; destination:string; dates:string; days:number; people:number; image:string; color:string; spent:number; budget:number; next:string; status:string; members?:string[]; circleName?:string };
export const trips:Trip[]=[
{id:'porto',title:'Escapade à Porto',destination:'Porto, Portugal',dates:'12 — 17 juin 2026',days:6,people:4,image:'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=85',color:'#E5B47E',spent:318140,budget:787148,next:'Livraria Lello · 10:30',status:'En cours'},
{id:'cotonou',title:'Week-end à Cotonou',destination:'Cotonou, Bénin',dates:'24 — 26 juillet 2026',days:3,people:6,image:'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200&q=85',color:'#D8A282',spent:0,budget:557563,next:'Départ dans 26 jours',status:'À venir'},
{id:'marrakech',title:'Soleil à Marrakech',destination:'Marrakech, Maroc',dates:'3 — 9 octobre 2026',days:7,people:3,image:'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1200&q=85',color:'#C17952',spent:0,budget:1049531,next:'Dans 98 jours',status:'À venir'}];
export function createTrip(input: { title: string; destination: string; members?: string[]; circleName?: string }): Trip {
  const trip: Trip = {
    id: `trip-${Date.now()}`,
    title: input.title,
    destination: input.destination,
    dates: 'Dates à organiser',
    days: 1,
    people: input.members?.length ?? 1,
    members: input.members,
    circleName: input.circleName,
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=85',
    color: '#789477',
    spent: 0,
    budget: 0,
    next: 'À organiser',
    status: 'À préparer',
  };
  trips.unshift(trip);
  recordGroupActivity({ category: "trip", groupId: trip.id, groupName: trip.title, title: "Un voyage a été créé", description: `${trip.destination} · ${trip.people} participant(s)`, actor: "Toi", icon: "trip", href: `/trip/${trip.id}` });
  return trip;
}
export const discover=[{title:'Les couleurs de Chefchaouen',place:'Maroc · 5 jours',emoji:'🧿',saves:248},{title:'Cascades et nature',place:'Islande · 8 jours',emoji:'🌋',saves:192},{title:'Un été à Lisbonne',place:'Portugal · 4 jours',emoji:'🚋',saves:175}];
export const itinerary=[{time:'09:00',title:'Petit-déjeuner chez Zenith',type:'Restaurant',icon:'☕',location:'Rua do Telhal, Porto',price:'7 900 FCFA / pers.'},{time:'10:30',title:'Livraria Lello',type:'Culture',icon:'📚',location:'R. das Carmelitas 144',price:'5 250 FCFA / pers.'},{time:'13:00',title:'Déjeuner au Mercado do Bolhão',type:'Cuisine locale',icon:'🥐',location:'Rua Formosa 322',price:'11 800 FCFA / pers.'},{time:'15:30',title:'Balade dans Ribeira',type:'Promenade',icon:'🌊',location:'Quais du Douro',price:'Gratuit'}];
export const initialPacking=[{id:'1',label:'Passeport et carte d’identité',category:'Documents',done:true},{id:'2',label:'Chargeur de téléphone',category:'Électronique',done:true},{id:'3',label:'Lunettes de soleil',category:'Accessoires',done:false},{id:'4',label:'Crème solaire',category:'Toilette',done:false},{id:'5',label:'Chaussures confortables',category:'Vêtements',done:false},{id:'6',label:'Adaptateur de prise',category:'Électronique',done:false}];
export const expenses=[{name:'Hébergement · Casa do Mercado',who:'Amadou',amount:157440,emoji:'🏡',color:'#F2E5D8'},{name:'Dîner chez Taberna Santo António',who:'Mariam',amount:56400,emoji:'🍽️',color:'#E7EBDC'},{name:'Billets Livraria Lello',who:'Toi',amount:21000,emoji:'🎟️',color:'#EEE5D8'}];
export const journal=[{day:'JOUR 1 · 12 JUIN',title:'Première soirée au bord du Douro',body:'La lumière dorée sur les façades de Ribeira… Porto nous a accueillis comme dans un film. On a terminé la soirée autour d’une francesinha mémorable.',emoji:'🌅'},{day:'JOUR 2 · 13 JUIN',title:'La ville se réveille',body:'Café, azulejos et longues promenades. On a découvert une petite boulangerie qui va devenir notre QG.',emoji:'☕'}];
