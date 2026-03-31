import { FlightDashProvider } from '../components/flightdash/context/FlightDashContext';
import { LogisticsMap } from '../components/flightdash/LogisticsMap';
import { OrderQueuePanel } from '../components/flightdash/OrderQueuePanel';
import { PayloadSensorsCard } from '../components/flightdash/PayloadSensorsCard';
import { TelemetryCard } from '../components/flightdash/TelemetryCard';
import { VideoFeedPanel } from '../components/flightdash/VideoFeedPanel';

function FlightControlContent() {
  return (
    <div className="-m-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Status bar */}
      <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#8A1538' }}>
            Flight Control
          </h1>
          <p className="text-gray-500 text-sm">Dispatch & network control</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-green-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Online
        </div>
      </div>

      {/* Main grid */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Left panel */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
          <OrderQueuePanel />
          <TelemetryCard />
          <PayloadSensorsCard />
        </div>

        {/* Right panel */}
        <div className="lg:col-span-9 flex flex-col gap-4 min-h-0">
          <LogisticsMap />
          <VideoFeedPanel />
        </div>
      </div>
    </div>
  );
}

export function FlightControlPage() {
  return (
    <FlightDashProvider>
      <FlightControlContent />
    </FlightDashProvider>
  );
}
