import { Activity, MapPin, Package, Play, Store } from 'lucide-react';
import { useFlightDash } from './context/FlightDashContext';

export function OrderQueuePanel() {
  const { orders, missionState, handleDispatch } = useFlightDash();
  const visible = orders.filter((o) => o.status !== 'completed');

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex-1 flex flex-col">
      <h3 className="font-medium text-gray-900 text-[18px] flex items-center gap-2 mb-4">
        <Package size={20} className="text-[#8A1538]" /> Order Queue
      </h3>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {visible.map((order) => (
          <div
            key={order.id}
            className={`p-4 rounded-xl border ${
              order.status === 'active'
                ? 'bg-[#f8e0e7] border-[#8A1538]'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold font-mono text-gray-500">{order.id}</span>
              {order.status === 'active' ? (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#8A1538] text-white px-2 py-0.5 rounded-full">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  Queued
                </span>
              )}
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">{order.item}</div>
            <div className="text-xs text-gray-500 flex flex-col gap-1 mb-3">
              <span className="flex items-center gap-1">
                <Store size={12} /> {order.vendor}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {order.location}
              </span>
            </div>

            {order.status === 'pending' && missionState === 'idle' && (
              <button
                type="button"
                onClick={() => {
                  void handleDispatch(order);
                }}
                className="w-full bg-[#8A1538] text-white py-2 rounded-full text-xs font-medium hover:bg-[#751130] transition-colors flex items-center justify-center gap-2"
              >
                <Play size={14} /> Dispatch Drone to Vendor
              </button>
            )}
            {order.status === 'active' && (
              <div className="text-xs font-medium text-[#8A1538] flex items-center justify-center gap-2 py-1">
                <Activity size={14} className="animate-spin" /> Mission in Progress
              </div>
            )}
          </div>
        ))}
        {visible.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">No active orders in queue.</div>
        )}
      </div>
    </div>
  );
}
