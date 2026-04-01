import { Activity, Battery } from 'lucide-react';
import { useFlightDash } from './context/FlightDashContext';

export function TelemetryCard() {
  const { missionState, droneAlt, droneBatt } = useFlightDash();

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <h3 className="font-medium text-gray-900 text-[16px] flex items-center gap-2 mb-4">
        <Activity size={18} className="text-[#8A1538]" /> Live Telemetry
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">
            State
          </div>
          <div className="text-sm font-medium text-gray-900 uppercase">
            {missionState.replaceAll('_', ' ')}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">
            Altitude
          </div>
          <div className="text-sm font-medium text-gray-900">{droneAlt.toFixed(1)} m</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex justify-between items-center col-span-2">
          <div>
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">
              Flight Battery
            </div>
            <div className="text-lg font-medium text-gray-900">{droneBatt.toFixed(0)}%</div>
          </div>
          <Battery size={24} className={droneBatt > 20 ? 'text-green-600' : 'text-red-600'} />
        </div>
      </div>
    </div>
  );
}
