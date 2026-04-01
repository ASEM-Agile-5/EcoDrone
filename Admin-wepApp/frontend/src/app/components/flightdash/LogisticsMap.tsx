import { useEffect, useState } from 'react';
import { Map as MapIcon, MapPin, Maximize, Minus, Plus } from 'lucide-react';
import { useFlightDash } from './context/FlightDashContext';
import { useMapEngine } from './hooks/useMapEngine';
import { BASE_ZOOM, TILE_SIZE } from './constants';

export function LogisticsMap() {
  const {
    waypoints,
    activeOrder,
    dronePos,
    missionState,
    zoom,
    setZoom,
    pan,
    mapRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    centerMap,
  } = useFlightDash();
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  const { centerPx, project } = useMapEngine(zoom, pan);

  useEffect(() => {
    const element = mapRef.current;
    if (!element) return;

    const updateSize = () => {
      setMapSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [mapRef]);

  const renderMapTiles = () => {
    const cx = centerPx.x - pan.x / zoom;
    const cy = centerPx.y - pan.y / zoom;
    const tx = Math.floor(cx / TILE_SIZE);
    const ty = Math.floor(cy / TILE_SIZE);
    const radius = Math.max(2, Math.ceil(3 / zoom));
    const tiles = [];

    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
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
            opacity={0.7}
            style={{ filter: 'grayscale(0.1) contrast(1.1)' }}
          />
        );
      }
    }
    return tiles;
  };

  const baseProj = project(waypoints.BASE.lat, waypoints.BASE.lon);
  const centerX = mapSize.width > 0 ? mapSize.width / 2 : 400;
  const centerY = mapSize.height > 0 ? mapSize.height / 2 : 300;

  return (
    <div className="flex-1 bg-gray-100 rounded-xl overflow-hidden relative shadow-sm border border-gray-200 flex flex-col">
      <div className="p-3 bg-white border-b border-gray-200 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-2 text-gray-900">
          <MapIcon size={18} className="text-[#8A1538]" />
          <span className="font-medium text-[14px]">Logistics Network Map</span>
        </div>
        <div className="text-xs font-medium bg-[#f8e0e7] text-[#8A1538] px-3 py-1 rounded-full">
          Auto-Routing Active
        </div>
      </div>

      <div
        ref={mapRef}
        className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden bg-gray-200"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <g transform={`translate(${centerX} ${centerY})`}>
            {renderMapTiles()}

            {Object.entries(waypoints).map(([key, wp]) => {
              const p = project(wp.lat, wp.lon);
              return (
                <g key={key} transform={`translate(${p.x}, ${p.y})`}>
                  <circle cx="0" cy="0" r={8 * zoom} fill="white" stroke="#8A1538" strokeWidth={2 * zoom} />
                  <MapPin
                    size={10 * zoom}
                    color="#8A1538"
                    style={{ transform: `translate(-${5 * zoom}px, -${5 * zoom}px)` }}
                  />
                  <rect
                    x={12 * zoom}
                    y={-10 * zoom}
                    width="100"
                    height="20"
                    fill="white"
                    opacity="0.85"
                    rx="4"
                  />
                  <text x={16 * zoom} y={4 * zoom} fontSize="10" fill="#111827" fontWeight="600">
                    {wp.name}
                  </text>
                </g>
              );
            })}

            {activeOrder && (
              <g opacity="0.5">
                <line
                  x1={baseProj.x}
                  y1={baseProj.y}
                  x2={project(activeOrder.wpVendor.lat, activeOrder.wpVendor.lon).x}
                  y2={project(activeOrder.wpVendor.lat, activeOrder.wpVendor.lon).y}
                  stroke="#8A1538"
                  strokeWidth={3 * zoom}
                  strokeDasharray="5,5"
                />
                <line
                  x1={project(activeOrder.wpVendor.lat, activeOrder.wpVendor.lon).x}
                  y1={project(activeOrder.wpVendor.lat, activeOrder.wpVendor.lon).y}
                  x2={project(activeOrder.wpBuyer.lat, activeOrder.wpBuyer.lon).x}
                  y2={project(activeOrder.wpBuyer.lat, activeOrder.wpBuyer.lon).y}
                  stroke="#751130"
                  strokeWidth={3 * zoom}
                  strokeDasharray="5,5"
                />
              </g>
            )}

            {(() => {
              const p = project(dronePos.lat, dronePos.lon);
              return (
                <g transform={`translate(${p.x}, ${p.y})`} className="transition-all duration-300">
                  {missionState !== 'idle' &&
                    missionState !== 'at_vendor' &&
                    missionState !== 'at_buyer' && (
                      <circle cx="0" cy="0" r={24 * zoom} fill="#8A1538" opacity="0.2" className="animate-ping" />
                    )}
                  {/* Arms */}
                  <line x1={0} y1={0} x2={10 * zoom} y2={-10 * zoom} stroke="#8A1538" strokeWidth={2.5 * zoom} strokeLinecap="round" />
                  <line x1={0} y1={0} x2={-10 * zoom} y2={-10 * zoom} stroke="#8A1538" strokeWidth={2.5 * zoom} strokeLinecap="round" />
                  <line x1={0} y1={0} x2={10 * zoom} y2={10 * zoom} stroke="#8A1538" strokeWidth={2.5 * zoom} strokeLinecap="round" />
                  <line x1={0} y1={0} x2={-10 * zoom} y2={10 * zoom} stroke="#8A1538" strokeWidth={2.5 * zoom} strokeLinecap="round" />
                  {/* Rotors */}
                  <circle cx={10 * zoom} cy={-10 * zoom} r={5 * zoom} fill="white" stroke="#8A1538" strokeWidth={1.5 * zoom} opacity={0.95} />
                  <circle cx={-10 * zoom} cy={-10 * zoom} r={5 * zoom} fill="white" stroke="#8A1538" strokeWidth={1.5 * zoom} opacity={0.95} />
                  <circle cx={10 * zoom} cy={10 * zoom} r={5 * zoom} fill="white" stroke="#8A1538" strokeWidth={1.5 * zoom} opacity={0.95} />
                  <circle cx={-10 * zoom} cy={10 * zoom} r={5 * zoom} fill="white" stroke="#8A1538" strokeWidth={1.5 * zoom} opacity={0.95} />
                  {/* Body */}
                  <circle cx={0} cy={0} r={5 * zoom} fill="#8A1538" stroke="white" strokeWidth={1.5 * zoom} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))' }} />
                </g>
              );
            })()}
          </g>
        </svg>

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
            className="bg-white text-[#8A1538] p-2.5 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Plus size={18} />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.5, 0.4))}
            className="bg-white text-[#8A1538] p-2.5 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Minus size={18} />
          </button>
          <button
            type="button"
            onClick={centerMap}
            className="bg-white text-[#8A1538] p-2.5 rounded-xl mt-2 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
