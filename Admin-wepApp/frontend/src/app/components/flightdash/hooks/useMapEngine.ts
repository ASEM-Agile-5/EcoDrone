import { useMemo } from 'react';
import { BASE_ZOOM, TILE_SIZE } from '../constants';

export function latLonToWorldPx(lat: number, lon: number) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const x = ((lon + 180) / 360) * TILE_SIZE * 2 ** BASE_ZOOM;
  const y =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) *
    TILE_SIZE *
    2 ** BASE_ZOOM;
  return { x, y };
}

export function useMapEngine(
  center: { lat: number; lon: number },
  zoom: number,
  pan: { x: number; y: number }
) {
  const centerPx = useMemo(() => latLonToWorldPx(center.lat, center.lon), [center.lat, center.lon]);

  const project = useMemo(
    () => (lat: number, lon: number) => {
      const px = latLonToWorldPx(lat, lon);
      return {
        x: (px.x - centerPx.x) * zoom + pan.x,
        y: (px.y - centerPx.y) * zoom + pan.y,
      };
    },
    [centerPx, zoom, pan.x, pan.y]
  );

  return { centerPx, project };
}
