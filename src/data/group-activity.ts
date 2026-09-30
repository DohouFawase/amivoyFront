export type ActivityCategory = "outing" | "trip" | "circle";
export type GroupActivity = {
  id: string;
  category: ActivityCategory;
  groupId: string;
  groupName: string;
  title: string;
  description: string;
  actor: string;
  time: string;
  icon: string;
  href: string;
};

let activities: GroupActivity[] = [
  { id: "demo-vote", category: "trip", groupId: "porto", groupName: "Escapade à Porto", title: "Le programme du jour est confirmé", description: "La bande a choisi la visite de Livraria Lello.", actor: "Mariam", time: "Aujourd’hui · 10:20", icon: "check", href: "/trip/porto/planning" },
  { id: "demo-expense", category: "trip", groupId: "porto", groupName: "Escapade à Porto", title: "Une dépense a été ajoutée", description: "Amadou a payé 15 750 FCFA au café Zenith.", actor: "Amadou", time: "Aujourd’hui · 09:45", icon: "payments", href: "/trip/porto/budget" },
  { id: "demo-outing", category: "outing", groupId: "place-etoile-demo", groupName: "Soirée à la Place de l’Étoile", title: "La sortie est organisée", description: "Le groupe se retrouve ce soir à Cotonou.", actor: "Samira", time: "Aujourd’hui · 08:30", icon: "outing", href: "/outing/place-etoile-demo" },
  { id: "demo-circle", category: "circle", groupId: "circles", groupName: "Mes proches", title: "Le cercle est prêt pour les prochaines sorties", description: "Les amis peuvent préparer un voyage ou une sortie ensemble.", actor: "Toi", time: "Hier · 18:15", icon: "group", href: "/circles" },
];

export function recordGroupActivity(input: Omit<GroupActivity, "id" | "time"> & { time?: string }): void {
  activities = [{ ...input, id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, time: input.time ?? "À l’instant" }, ...activities].slice(0, 60);
}

export function listGroupActivities(category?: ActivityCategory | "all"): GroupActivity[] {
  return activities.filter((item) => !category || category === "all" || item.category === category).map((item) => ({ ...item }));
}
