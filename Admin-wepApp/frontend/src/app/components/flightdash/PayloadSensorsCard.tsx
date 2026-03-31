import { Cloud, Droplets, Thermometer } from 'lucide-react';
import { useFlightDash } from './context/FlightDashContext';

export function PayloadSensorsCard() {
  const { ecoData } = useFlightDash();

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <h3 className="font-medium text-gray-900 text-[16px] flex items-center gap-2 mb-4">
        <Cloud size={18} className="text-[#8A1538]" /> Payload Sensors
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex flex-col items-center text-center">
          <Thermometer size={16} className="text-red-600 mb-1" />
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Temp</div>
          <div className="text-sm font-medium text-gray-900">{ecoData.temp.toFixed(1)}°C</div>
        </div>
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex flex-col items-center text-center">
          <Droplets size={16} className="text-blue-600 mb-1" />
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hum</div>
          <div className="text-sm font-medium text-gray-900">{ecoData.hum.toFixed(0)}%</div>
        </div>
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex flex-col items-center text-center">
          <Cloud size={16} className="text-green-700 mb-1" />
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CO2</div>
          <div className="text-sm font-medium text-gray-900">{ecoData.co2.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}
