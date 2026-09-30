export type TripPlanItem = {
  id: string;
  tripId: string;
  title: string;
  type: string;
  location: string;
  time: string;
  description: string;
  emoji: string;
};
let planned: TripPlanItem[] = [];
export function listTripPlanItems(tripId: string): TripPlanItem[] {
  return planned.filter((item) => item.tripId === tripId);
}
export function addTripPlanItem(item: TripPlanItem): void {
  planned = [item, ...planned.filter((saved) => saved.tripId !== item.tripId || saved.id !== item.id)];
}
export function removeTripPlanItem(id: string): void {
  planned = planned.filter((item) => item.id !== id);
}
