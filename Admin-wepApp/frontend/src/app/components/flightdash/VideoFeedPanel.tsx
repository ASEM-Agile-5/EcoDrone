import { Video, VideoOff } from 'lucide-react';
import { useFlightDash } from './context/FlightDashContext';

export function VideoFeedPanel() {
  const { videoActive, setVideoActive } = useFlightDash();

  return (
    <div className="h-52 bg-gray-900 rounded-xl overflow-hidden relative shadow-sm border border-gray-700 flex flex-col justify-center items-center text-gray-400">
      {videoActive ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#8A1538]/20 to-[#751130]/20 flex items-center justify-center">
          <span className="animate-pulse text-gray-300">Live SIYI HM30 Stream connecting...</span>
        </div>
      ) : (
        <>
          <VideoOff size={32} className="mb-3 opacity-50" />
          <p className="text-sm font-medium opacity-70 mb-4">Payload Camera Standby</p>
          <button
            type="button"
            onClick={() => setVideoActive(true)}
            className="bg-gray-700 text-gray-100 px-4 py-2 rounded-full text-xs font-medium hover:bg-[#8A1538] transition-colors flex items-center gap-2"
          >
            <Video size={14} /> Connect SIYI IP Stream
          </button>
        </>
      )}

      <div className="absolute top-4 left-4 flex gap-2">
        <span className="bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> REC
        </span>
        <span className="bg-black/50 text-white text-[10px] font-mono px-2 py-0.5 rounded">
          1080p 60fps
        </span>
      </div>
      <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/50">
        IP: 192.168.144.25
      </div>
    </div>
  );
}
