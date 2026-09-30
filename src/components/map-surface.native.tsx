import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import type { MapSurfaceProps } from './map-surface.types';

export default function MapSurface({ latitude, longitude, zoom = 4, points, selectedId, onSelect }: MapSurfaceProps) {
  const delta = Math.max(0.025, 80 / Math.pow(2, zoom));
  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={StyleSheet.absoluteFill}
      initialRegion={{ latitude, longitude, latitudeDelta: delta, longitudeDelta: delta }}
      showsCompass
      showsScale
      rotateEnabled={false}
    >
      {points.map((point) => (
        <Marker
          key={point.id}
          coordinate={{ latitude: point.latitude, longitude: point.longitude }}
          title={point.name}
          pinColor={selectedId === point.id ? '#133B2C' : '#FFD000'}
          onPress={() => onSelect?.(point)}
        />
      ))}
    </MapView>
  );
}
