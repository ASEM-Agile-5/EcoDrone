import { Thermometer, Wind, AlertTriangle } from "lucide-react";
import { AshesiCampusMap } from "../components/AshesiCampusMap";
import React, { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { get, ref } from "firebase/database";
import { signInAnonymously } from "firebase/auth";
import { db, firebaseAuth, isFirebaseConfigured } from "../../lib/firebase";

type ChartPoint = { time: string; value: number };

type GasPayload = {
  raw?: number;
  ppm?: number;
  alert?: string;
};

type SensorsPayload = {
  temperature?: number;
  humidity?: number;
  gas?: GasPayload;
  lastUpdated?: number;
};

const MAX_CHART_POINTS = 14;

const droneLocations = [
  { id: "DRONE-01", location: "Library", status: "Safe", lat: 5.759, lng: -0.224 },
  { id: "DRONE-02", location: "Sports Complex", status: "Safe", lat: 5.761, lng: -0.223 },
  { id: "DRONE-03", location: "Engineering Block", status: "Safe", lat: 5.76, lng: -0.222 },
  { id: "DRONE-05", location: "Dorm Building A", status: "Warning", lat: 5.762, lng: -0.225 },
];

function alertToUi(alert?: string): "Safe" | "Warning" | "Critical" {
  const a = (alert || "").toUpperCase();
  if (a === "DANGER") return "Critical";
  if (a === "WARNING") return "Warning";
  return "Safe";
}

function badgeClass(level: "Safe" | "Warning" | "Critical") {
  if (level === "Critical") return "bg-red-600";
  if (level === "Warning") return "bg-amber-600";
  return "bg-green-600";
}

function cardTone(level: "Safe" | "Warning" | "Critical") {
  if (level === "Critical") return "bg-red-50 border-red-200 text-red-900";
  if (level === "Warning") return "bg-amber-50 border-amber-200 text-amber-900";
  return "bg-green-50 border-green-200 text-green-900";
}

export function EnvironmentalPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sensors, setSensors] = useState<SensorsPayload | null>(null);
  const [tempSeries, setTempSeries] = useState<ChartPoint[]>([]);
  const [humSeries, setHumSeries] = useState<ChartPoint[]>([]);
  const [gasSeries, setGasSeries] = useState<ChartPoint[]>([]);
  /** Only add a chart point when ESP writes a new sample (lastUpdated changes). */
  const lastUpdatedSeen = useRef<number | undefined>(undefined);

  // Use periodic get() instead of only onValue — the RTDB websocket can appear "stuck" in dev
  // (tabs, Strict Mode, network), while REST reads stay reliable.
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !firebaseAuth) {
      setError(
        "Firebase is not configured. In Admin-wepApp/frontend, copy .env.example to .env, add your VITE_FIREBASE_* values from Firebase Console, then restart the dev server.",
      );
      setLoading(false);
      return;
    }

    let active = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const sensorsRef = ref(db, "sensors");

    const applyChartsForNewSample = (v: SensorsPayload | null) => {
      const lu = v?.lastUpdated;
      if (lu === undefined || lu === lastUpdatedSeen.current) return;
      lastUpdatedSeen.current = lu;

      const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      if (v?.temperature != null && !Number.isNaN(v.temperature)) {
        setTempSeries((prev) => [...prev, { time: t, value: v.temperature! }].slice(-MAX_CHART_POINTS));
      }
      if (v?.humidity != null && !Number.isNaN(v.humidity)) {
        setHumSeries((prev) => [...prev, { time: t, value: v.humidity! }].slice(-MAX_CHART_POINTS));
      }
      const ppm = v?.gas?.ppm;
      if (ppm != null && !Number.isNaN(ppm)) {
        setGasSeries((prev) => [...prev, { time: t, value: ppm }].slice(-MAX_CHART_POINTS));
      }
    };

    const pullOnce = async () => {
      try {
        const snap = await get(sensorsRef);
        if (!active) return;
        const v = snap.val() as SensorsPayload | null;
        setSensors(v);
        setLoading(false);
        setError(null);
        applyChartsForNewSample(v);
      } catch (e: unknown) {
        if (!active) return;
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setLoading(false);
      }
    };

    (async () => {
      setError(null);
      setLoading(true);
      try {
        await signInAnonymously(firebaseAuth);
      } catch (e) {
        console.warn("[Environmental] Anonymous auth failed:", e);
      }
      if (!active) return;

      await pullOnce();
      intervalId = window.setInterval(() => {
        void pullOnce();
      }, 1500);
    })();

    return () => {
      active = false;
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  const gasLevel = alertToUi(sensors?.gas?.alert);
  const tempLevel: "Safe" | "Warning" | "Critical" =
    sensors?.temperature != null && (sensors.temperature < 18 || sensors.temperature > 35) ? "Warning" : "Safe";

  const tempDisplay = sensors?.temperature != null ? `${sensors.temperature.toFixed(1)}°C` : "—";
  const humDisplay = sensors?.humidity != null ? `${sensors.humidity.toFixed(1)}%` : "—";
  const gasPpmDisplay = sensors?.gas?.ppm != null ? `${sensors.gas.ppm} ppm` : "—";
  const updatedDisplay =
    sensors?.lastUpdated != null ? `Last update (device s): ${sensors.lastUpdated}` : "Waiting for data…";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: "#8A1538" }}>
          Environmental Monitoring
        </h1>
        <p className="text-gray-600">Live data from Firebase Realtime Database (/sensors) — ESP32 + DHT11 + MQ2</p>
        {loading && <p className="text-sm text-gray-500 mt-2">Connecting…</p>}
        {error && (
          <p className="text-sm text-red-600 mt-2">
            {error} — check .env Firebase config and Realtime Database rules (read allowed for signed-in users).
          </p>
        )}
        {!error && !loading && sensors == null && (
          <p className="text-sm text-amber-700 mt-2">No /sensors node yet. Is the ESP32 online?</p>
        )}
        <p className="text-xs text-gray-500 mt-1">{updatedDisplay}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-xl p-6 border ${cardTone(tempLevel)}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-white" />
            </div>
            <span className={`px-3 py-1 text-white rounded-full text-xs ${badgeClass(tempLevel)}`}>{tempLevel}</span>
          </div>
          <div className="text-sm mb-1 opacity-80">Temperature</div>
          <div className="text-3xl mb-2">{tempDisplay}</div>
          <div className="text-xs opacity-70">From /sensors/temperature</div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs">Humidity</span>
          </div>
          <div className="text-sm text-green-800 mb-1">Relative humidity</div>
          <div className="text-3xl text-green-900 mb-2">{humDisplay}</div>
          <div className="text-xs text-green-700">From /sensors/humidity</div>
        </div>

        <div className={`rounded-xl p-6 border ${cardTone(gasLevel)}`}>
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                gasLevel === "Critical" ? "bg-red-600" : gasLevel === "Warning" ? "bg-amber-600" : "bg-green-600"
              }`}
            >
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className={`px-3 py-1 text-white rounded-full text-xs ${badgeClass(gasLevel)}`}>{gasLevel}</span>
          </div>
          <div className="text-sm mb-1 opacity-80">Gas (MQ2 est.)</div>
          <div className="text-3xl mb-2">{gasPpmDisplay}</div>
          <div className="text-xs opacity-70">
            Alert: {sensors?.gas?.alert ?? "—"} · raw {sensors?.gas?.raw ?? "—"}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl mb-4" style={{ color: "#8A1538" }}>
          Campus Drone Map
        </h3>
        <AshesiCampusMap markers={droneLocations} height={400} />
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-600">Safe Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <span className="text-gray-600">Warning Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-600">Critical Status</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-[#8A1538]" />
            Temperature (live)
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tempSeries.length ? tempSeries : [{ time: "—", value: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#666" />
              <YAxis tick={{ fontSize: 11 }} stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-[#8A1538]" />
            Humidity (live)
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={humSeries.length ? humSeries : [{ time: "—", value: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#666" />
              <YAxis tick={{ fontSize: 11 }} stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={{ fill: "#38bdf8", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#8A1538]" />
            Gas PPM (live)
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={gasSeries.length ? gasSeries : [{ time: "—", value: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#666" />
              <YAxis tick={{ fontSize: 11 }} stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl mb-4" style={{ color: "#8A1538" }}>
          Active Sensors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {droneLocations.map((drone) => (
            <div key={drone.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono">{drone.id}</span>
                <span
                  className={`w-2 h-2 rounded-full ${drone.status === "Safe" ? "bg-green-500" : "bg-amber-500"}`}
                />
              </div>
              <div className="text-xs text-gray-600">{drone.location}</div>
              <div className="text-xs text-gray-500 mt-1">
                {drone.lat.toFixed(3)}°, {drone.lng.toFixed(3)}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
