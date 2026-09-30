/** Démonstration locale des prochaines fonctions Amivoy. Aucune API n'est appelée. */
export type MockInvitation = {
  id: string;
  name: string;
  destination: string;
  channel: "WhatsApp" | "SMS" | "E-mail";
  status: "Envoyée" | "Acceptée" | "En attente";
};

export type MockNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export type MockTravelStop = {
  id: string;
  city: string;
  country: string;
  arrival: string;
  nights: number;
  lodging: string;
  lodgingPrice: number;
  activities: string[];
};

export const mockInvitations: MockInvitation[] = [
  { id: "invite-1", name: "Samira", destination: "Cotonou", channel: "WhatsApp", status: "Acceptée" },
  { id: "invite-2", name: "Yann", destination: "Cotonou", channel: "SMS", status: "En attente" },
  { id: "invite-3", name: "Mariam", destination: "Cotonou", channel: "E-mail", status: "Envoyée" },
];

export const mockNotifications: MockNotification[] = [
  { id: "notice-1", title: "Le programme a changé", message: "Le groupe a ajouté une étape au marché Dantokpa.", time: "Il y a 12 min", read: false },
  { id: "notice-2", title: "Rappel de sortie", message: "Rendez-vous à la Place de l’Étoile à 19 h.", time: "Aujourd’hui", read: false },
  { id: "notice-3", title: "Nouveau vote", message: "Choisissez le restaurant pour vendredi.", time: "Hier", read: true },
];

export const mockTravelStops: MockTravelStop[] = [
  {
    id: "stop-cotonou",
    city: "Cotonou",
    country: "Bénin",
    arrival: "12 juin",
    nights: 3,
    lodging: "Maison des Palmiers",
    lodgingPrice: 28000,
    activities: ["Place de l’Étoile", "Marché Dantokpa", "Fondation Zinsou"],
  },
  {
    id: "stop-porto-novo",
    city: "Porto-Novo",
    country: "Bénin",
    arrival: "15 juin",
    nights: 2,
    lodging: "Auberge des Trois Rivières",
    lodgingPrice: 22000,
    activities: ["Musée Honmè", "Jardin des Plantes et de la Nature"],
  },
];

export const mockSouvenir = {
  title: "Nos beaux moments à Cotonou",
  date: "12–15 juin 2026",
  members: ["Toi", "Samira", "Yann", "Mariam"],
  highlights: ["Un dîner tous ensemble", "La balade au bord de mer", "Nos fous rires au marché"],
  photoUri: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=85",
};
