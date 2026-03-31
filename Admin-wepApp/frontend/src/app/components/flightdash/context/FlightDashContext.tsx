import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { WAYPOINTS } from '../constants';
import { initialOrders } from '../data';

interface Order {
  id: string;
  vendor: string;
  buyer: string;
  item: string;
  status: string;
  wpVendor: { lat: number; lon: number };
  wpBuyer: { lat: number; lon: number };
}

interface FlightDashContextValue {
  currentTime: string;
  orders: Order[];
  activeOrder: Order | null;
  missionState: string;
  dronePos: { lat: number; lon: number };
  droneAlt: number;
  droneBatt: number;
  videoActive: boolean;
  setVideoActive: (v: boolean) => void;
  ecoData: { temp: number; hum: number; co2: number };
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  mapRef: React.RefObject<HTMLDivElement | null>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleWheel: (e: React.WheelEvent) => void;
  centerMap: () => void;
  handleDispatch: (order: Order) => void;
  waypoints: typeof WAYPOINTS;
}

const FlightDashContext = createContext<FlightDashContextValue | null>(null);

export function FlightDashProvider({ children }: { children: React.ReactNode }) {
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString());
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [missionState, setMissionState] = useState('idle');
  const [dronePos, setDronePos] = useState<{ lat: number; lon: number }>(WAYPOINTS.BASE);
  const [droneAlt, setDroneAlt] = useState(0);
  const [droneBatt, setDroneBatt] = useState(98);
  const [videoActive, setVideoActive] = useState(false);
  const [ecoData, setEcoData] = useState({ temp: 28.5, hum: 65, co2: 415 });
  const [zoom, setZoom] = useState(2.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragPointerRef = useRef({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement | null>(null);

  const updateOrderStatus = useCallback((id: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
  }, []);

  useEffect(() => {
    const clockTimer = setInterval(
      () => setCurrentTime(new Date().toLocaleTimeString()),
      1000
    );
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    const ecoTimer = setInterval(() => {
      setEcoData((prev) => ({
        temp: prev.temp + (Math.random() * 0.2 - 0.1),
        hum: Math.max(0, Math.min(100, prev.hum + (Math.random() * 1 - 0.5))),
        co2: prev.co2 + (Math.random() * 2 - 1),
      }));
    }, 3000);
    return () => clearInterval(ecoTimer);
  }, []);

  useEffect(() => {
    let flightInterval: ReturnType<typeof setInterval>;

    const moveTowards = (
      targetWp: { lat: number; lon: number },
      altitudeTarget: number,
      speed: number,
      nextState: string
    ) => {
      setDronePos((prev) => {
        const dx = targetWp.lon - prev.lon;
        const dy = targetWp.lat - prev.lat;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.00005) {
          setMissionState(nextState);
          setDroneAlt(0);
          return targetWp;
        }
        const ratio = speed / dist;
        setDroneAlt((prevAlt) => (prevAlt < altitudeTarget ? prevAlt + 2 : altitudeTarget));
        return { lat: prev.lat + dy * ratio, lon: prev.lon + dx * ratio };
      });
      setDroneBatt((b) => Math.max(0, b - 0.05));
    };

    if (missionState === 'to_vendor' && activeOrder) {
      flightInterval = setInterval(
        () => moveTowards(activeOrder.wpVendor, 40, 0.00008, 'at_vendor'),
        500
      );
    } else if (missionState === 'to_buyer' && activeOrder) {
      flightInterval = setInterval(
        () => moveTowards(activeOrder.wpBuyer, 60, 0.00008, 'at_buyer'),
        500
      );
    } else if (missionState === 'returning') {
      flightInterval = setInterval(
        () => moveTowards(WAYPOINTS.BASE, 40, 0.00008, 'idle'),
        500
      );
    } else if (missionState === 'at_vendor' && activeOrder) {
      const timer = setTimeout(() => {
        setMissionState('to_buyer');
      }, 3000);
      return () => clearTimeout(timer);
    } else if (missionState === 'at_buyer' && activeOrder) {
      const orderId = activeOrder.id;
      const timer = setTimeout(() => {
        setMissionState('returning');
        updateOrderStatus(orderId, 'completed');
        setActiveOrder(null);
      }, 4000);
      return () => clearTimeout(timer);
    }

    return () => clearInterval(flightInterval);
  }, [missionState, activeOrder, updateOrderStatus]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragPointerRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const o = dragPointerRef.current;
    setPan({ x: e.clientX - o.x, y: e.clientY - o.y });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.min(Math.max(0.4, prev - e.deltaY * 0.002), 4));
  };

  const centerMap = () => {
    setZoom(2.0);
    setPan({ x: 0, y: 0 });
  };

  const handleDispatch = (order: Order) => {
    setActiveOrder(order);
    setMissionState('to_vendor');
    updateOrderStatus(order.id, 'active');
  };

  const value: FlightDashContextValue = {
    currentTime,
    orders,
    activeOrder,
    missionState,
    dronePos,
    droneAlt,
    droneBatt,
    videoActive,
    setVideoActive,
    ecoData,
    zoom,
    setZoom,
    pan,
    mapRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    centerMap,
    handleDispatch,
    waypoints: WAYPOINTS,
  };

  return (
    <FlightDashContext.Provider value={value}>{children}</FlightDashContext.Provider>
  );
}

export function useFlightDash() {
  const ctx = useContext(FlightDashContext);
  if (!ctx) throw new Error('useFlightDash must be used within FlightDashProvider');
  return ctx;
}
