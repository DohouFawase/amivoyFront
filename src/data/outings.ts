import { recordGroupActivity } from "@/data/group-activity";
export type OutingPhoto = {
  id: string;
  uri: string;
  caption: string;
  createdAt: string;
  by: string;
  sharedToStory?: boolean;
};
export type OutingContribution = { id: string; by: string; amount: number; createdAt: string };
export type MockOuting = {
  id: string;
  title: string;
  place: string;
  locationType: "public" | "private";
  category: string;
  date: string;
  time: string;
  note: string;
  activity?: string;
  circleId?: string;
  circleName?: string;
  budgetTarget?: number;
  contributions: OutingContribution[];
  latitude?: number;
  longitude?: number;
  guests: string[];
  attending: string[];
  checkedIn: string[];
  photos: OutingPhoto[];
  started: boolean;
  ended: boolean;
};
let outings: MockOuting[] = [
  {
    id: "place-etoile-demo",
    title: "Soirée à la Place de l’Étoile",
    place: "Place de l’Étoile, Cotonou",
    locationType: "public",
    category: "Sortie entre amis",
    date: "Ce soir",
    time: "19:00",
    note: "On se retrouve à l’entrée principale, puis on choisit où manger.",
    activity: "Dîner ensemble après le rendez-vous",
    budgetTarget: 50000,
    contributions: [
      { id: "contrib-samira", by: "Samira", amount: 10000, createdAt: "Aujourd’hui" },
      { id: "contrib-amadou", by: "Amadou", amount: 5000, createdAt: "Aujourd’hui" },
    ],
    latitude: 6.3702,
    longitude: 2.4251,
    guests: ["Samira", "Amadou", "Mariam", "Yann"],
    attending: ["Samira", "Amadou", "Mariam"],
    checkedIn: [],
    photos: [],
    started: false,
    ended: false,
  },
];
export function createOuting(
  input: Omit<
    MockOuting,
    "id" | "attending" | "checkedIn" | "photos" | "contributions" | "started" | "ended"
  >,
): MockOuting {
  const outing: MockOuting = {
    ...input,
    id: `outing-${Date.now()}`,
    attending: ["Toi"],
    checkedIn: [],
    photos: [],
    contributions: [],
    started: false,
    ended: false,
  };
  outings = [outing, ...outings];
  recordGroupActivity({ category: "outing", groupId: outing.id, groupName: outing.title, title: "Une sortie a été organisée", description: `${outing.place} · ${outing.date} à ${outing.time}`, actor: "Toi", icon: "outing", href: `/outing/${outing.id}` });
  return outing;
}
export function getOuting(id: string): MockOuting | undefined {
  return outings.find((outing) => outing.id === id);
}
export function updateOuting(
  id: string,
  update: (outing: MockOuting) => MockOuting,
): MockOuting | undefined {
  const previous = getOuting(id);
  outings = outings.map((outing) => outing.id === id ? update(outing) : outing);
  const next = getOuting(id);
  if (previous && next) {
    const newPhoto = next.photos.find((photo) => !previous.photos.some((old) => old.id === photo.id));
    const newlyShared = next.photos.find((photo) => photo.sharedToStory && !previous.photos.find((old) => old.id === photo.id)?.sharedToStory);
    const newContribution = next.contributions.find((item) => !previous.contributions.some((old) => old.id === item.id));
    const newAttendee = next.attending.find((name) => !previous.attending.includes(name));
    if (newlyShared) {
      recordGroupActivity({ category: "outing", groupId: next.id, groupName: next.title, title: "Un souvenir a été publié dans la Story Amivoy", description: newlyShared.caption, actor: newlyShared.by, icon: "camera", href: `/memories/${next.id}?type=community` });
    } else if (newPhoto) {
      recordGroupActivity({ category: "outing", groupId: next.id, groupName: next.title, title: "Une photo a été ajoutée au carnet", description: newPhoto.caption, actor: newPhoto.by, icon: "camera", href: `/memories/${next.id}?type=outing` });
    } else if (newContribution) {
      recordGroupActivity({ category: "outing", groupId: next.id, groupName: next.title, title: "Une cotisation a été ajoutée", description: `${newContribution.amount.toLocaleString("fr-FR")} FCFA`, actor: newContribution.by, icon: "payments", href: `/outing/${next.id}` });
    } else if (newAttendee) {
      recordGroupActivity({ category: "outing", groupId: next.id, groupName: next.title, title: `${newAttendee} participe à la sortie`, description: `${next.date} · ${next.time} · ${next.place}`, actor: newAttendee, icon: "group", href: `/outing/${next.id}` });
    }
  }
  return next;
}

export function listOutings(): MockOuting[] {
  return [...outings];
}
