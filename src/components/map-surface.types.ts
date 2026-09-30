export type MapPoint = { id: string; name: string; latitude: number; longitude: number };
export type MapSurfaceProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  points: MapPoint[];
  selectedId?: string;
  onSelect?: (point: MapPoint) => void;
};
