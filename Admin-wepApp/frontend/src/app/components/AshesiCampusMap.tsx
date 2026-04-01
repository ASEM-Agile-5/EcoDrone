import { useRef, useState, useMemo } from 'react';
import { Maximize, Minus, Plus } from 'lucide-react';

const CENTER_LAT = 5.75985;
const CENTER_LON = -0.2201;
const BASE_ZOOM = 17;
const TILE_SIZE = 256;

function latLonToWorldPx(lat: number, lon: number) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const x = ((lon + 180) / 360) * TILE_SIZE * 2 ** BASE_ZOOM;
  const y =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) *
    TILE_SIZE *
    2 ** BASE_ZOOM;
  return { x, y };
}

interface DroneMarker {
  id: string;
  location: string;
  status: string;
  lat: number;
  lng: number;
}

interface Props {
  markers: DroneMarker[];
  height?: number;
}

export function AshesiCampusMap({ markers, height = 400 }: Props) {
  const [zoom, setZoom] = useState(2.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
  const dragPointerRef = useRef({ x: 0, y: 0 });

  const centerPx = useMemo(() => latLonToWorldPx(CENTER_LAT, CENTER_LON), []);

  const project = (lat: number, lon: number) => {
    const px = latLonToWorldPx(lat, lon);
    return {
      x: (px.x - centerPx.x) * zoom + pan.x,
      y: (px.y - centerPx.y) * zoom + pan.y,
    };
  };

  const renderTiles = () => {
    const cx = centerPx.x - pan.x / zoom;
    const cy = centerPx.y - pan.y / zoom;
    const tx = Math.floor(cx / TILE_SIZE);
    const ty = Math.floor(cy / TILE_SIZE);
    const radius = Math.max(2, Math.ceil(3 / zoom));
    const tiles = [];
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = tx + dx;
        const y = ty + dy;
        tiles.push(
          <image
            key={`${x}-${y}`}
            href={`https://a.tile.openstreetmap.org/${BASE_ZOOM}/${x}/${y}.png`}
            x={(x * TILE_SIZE - centerPx.x) * zoom + pan.x}
            y={(y * TILE_SIZE - centerPx.y) * zoom + pan.y}
            width={TILE_SIZE * zoom + 1}
            height={TILE_SIZE * zoom + 1}
            preserveAspectRatio="none"
            opacity={0.85}
            style={{ filter: 'grayscale(0.05) contrast(1.05)' }}
          />
        );
      }
    }
    return tiles;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragPointerRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    setPan({ x: e.clientX - dragPointerRef.current.x, y: e.clientY - dragPointerRef.current.y });
  };
  const handleMouseUp = () => { isDraggingRef.current = false; };
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(0.4, z - e.deltaY * 0.002), 4));
  };
  const resetView = () => { setZoom(2.0); setPan({ x: 0, y: 0 }); };

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      {/* Map canvas */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing bg-gray-200"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <g transform="translate(50%, 50%)">
            {renderTiles()}

            {/* Drone markers */}
            {markers.map((drone) => {
              const p = project(drone.lat, drone.lng);
              const isSafe = drone.status === 'Safe';
              const isHovered = hoveredId === drone.id;
              return (
                <g
                  key={drone.id}
                  transform={`translate(${p.x}, ${p.y})`}
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredId(drone.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Pulse ring */}
                  <circle
                    cx="0" cy="0"
                    r={14 * zoom}
                    fill={isSafe ? '#22c55e' : '#f59e0b'}
                    opacity={0.2}
                    className="animate-ping"
                  />
                  {/* Outer ring */}
                  <circle
                    cx="0" cy="0"
                    r={9 * zoom}
                    fill="white"
                    stroke={isSafe ? '#16a34a' : '#d97706'}
                    strokeWidth={2 * zoom}
                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}
                  />
                  {/* Inner dot */}
                  <circle
                    cx="0" cy="0"
                    r={4 * zoom}
                    fill={isSafe ? '#22c55e' : '#f59e0b'}
                  />

                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g transform={`translate(${12 * zoom}, ${-30 * zoom})`}>
                      <rect x="0" y="0" width={90 * zoom} height={44 * zoom} rx={4 * zoom} fill="#111827" opacity={0.9} />
                      <text x={7 * zoom} y={14 * zoom} fontSize={9 * zoom} fill="white" fontWeight="700" fontFamily="monospace">{drone.id}</text>
                      <text x={7 * zoom} y={26 * zoom} fontSize={8 * zoom} fill="#d1d5db">{drone.location}</text>
                      <text x={7 * zoom} y={38 * zoom} fontSize={8 * zoom} fill={isSafe ? '#4ade80' : '#fbbf24'}>{drone.status}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
          className="bg-white text-[#8A1538] p-2 rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(z - 0.5, 0.4))}
          className="bg-white text-[#8A1538] p-2 rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          onClick={resetView}
          className="bg-white text-[#8A1538] p-2 rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-colors mt-1"
        >
          <Maximize size={16} />
        </button>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-1 right-2 text-[9px] text-gray-500 z-10 pointer-events-none">
        © OpenStreetMap contributors
      </div>
    </div>
  );
}
