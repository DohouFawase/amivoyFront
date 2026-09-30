import type { CSSProperties } from 'react';
import type { MapSurfaceProps } from './map-surface.types';

export default function MapSurface({ latitude, longitude, zoom = 3, points }: MapSurfaceProps) {
  const delta = 80 / Math.pow(2, zoom);
  const bbox = zoom === 0 ? '-20%2C-37%2C55%2C38' : [longitude - delta / 2, latitude - delta / 3, longitude + delta / 2, latitude + delta / 3].join('%2C');
  const marker = points[0] ? `&marker=${points[0].latitude}%2C${points[0].longitude}` : '';
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`;
  return (
    <div style={styles.frame}>
      <iframe title="Carte interactive de TripVibe" src={src} style={styles.iframe} loading="lazy" />
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" style={styles.credit}>© OpenStreetMap</a>
    </div>
  );
}
const styles: Record<string, CSSProperties> = {
  frame: { position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 22 },
  iframe: { width: '100%', height: '100%', border: 0 },
  credit: { position: 'absolute', bottom: 5, right: 6, backgroundColor: '#fff', color: '#133B2C', padding: '3px 6px', borderRadius: 4, fontSize: 10 },
};
