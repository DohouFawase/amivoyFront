import { recordGroupActivity } from "@/data/group-activity";
export type FriendCircle = {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
};

export const suggestedFriends = ["Amadou", "Mariam", "Yann", "Inès", "Koffi"];
let circles: FriendCircle[] = [];

export function listCircles(): FriendCircle[] {
  return circles.map((circle) => ({ ...circle, members: [...circle.members] }));
}

export function createCircle(name: string, friends: string[]): FriendCircle {
  const circle = {
    id: `circle-${Date.now()}`,
    name: name.trim() || "Mes proches",
    members: ["Toi", ...new Set(friends)],
    createdAt: "À l’instant",
  };
  circles = [circle, ...circles];
  recordGroupActivity({ category: "circle", groupId: circle.id, groupName: circle.name, title: "Un cercle d’amis a été créé", description: `${circle.members.length} membre(s) prêt(s) à organiser des activités.`, actor: "Toi", icon: "group", href: "/circles" });
  return circle;
}

export function updateCircle(id: string, update: (circle: FriendCircle) => FriendCircle): void {
  const previous = circles.find((circle) => circle.id === id);
  circles = circles.map((circle) => circle.id === id ? update(circle) : circle);
  const next = circles.find((circle) => circle.id === id);
  if (previous && next && previous.members.join("|") !== next.members.join("|")) {
    const added = next.members.find((member) => !previous.members.includes(member));
    const removed = previous.members.find((member) => !next.members.includes(member));
    const person = added ?? removed ?? "Un membre";
    recordGroupActivity({ category: "circle", groupId: id, groupName: next.name, title: added ? `${person} a rejoint le cercle` : `${person} a quitté le cercle`, description: `${next.members.length} membre(s) dans le groupe.`, actor: "Toi", icon: "group", href: "/circles" });
  }
}

export function deleteCircle(id: string): void {
  const circle = circles.find((item) => item.id === id);
  circles = circles.filter((item) => item.id !== id);
  if (circle) recordGroupActivity({ category: "circle", groupId: id, groupName: circle.name, title: "Le cercle a été supprimé", description: "Le groupe n’est plus disponible dans cette session.", actor: "Toi", icon: "group", href: "/circles" });
}
