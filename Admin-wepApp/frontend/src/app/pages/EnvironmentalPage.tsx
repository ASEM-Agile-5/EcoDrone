import { Thermometer, Wind, AlertTriangle } from "lucide-react";
import { AshesiCampusMap } from "../components/AshesiCampusMap";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const temperatureData = [
  { time: "08:00", value: 24 },
  { time: "09:00", value: 25 },
  { time: "10:00", value: 26 },
  { time: "11:00", value: 27 },
  { time: "12:00", value: 28 },
  { time: "13:00", value: 29 },
  { time: "14:00", value: 28 },
];

const co2Data = [
  { time: "08:00", value: 410 },
  { time: "09:00", value: 415 },
  { time: "10:00", value: 420 },
  { time: "11:00", value: 418 },
  { time: "12:00", value: 425 },
  { time: "13:00", value: 422 },
  { time: "14:00", value: 420 },
];

const coData = [
  { time: "08:00", value: 0.5 },
  { time: "09:00", value: 0.6 },
  { time: "10:00", value: 0.7 },
  { time: "11:00", value: 0.6 },
  { time: "12:00", value: 0.8 },
  { time: "13:00", value: 0.7 },
  { time: "14:00", value: 0.6 },
];

const droneLocations = [
  { id: "DRONE-01", location: "Library", status: "Safe", lat: 5.759, lng: -0.224 },
  { id: "DRONE-02", location: "Sports Complex", status: "Safe", lat: 5.761, lng: -0.223 },
  { id: "DRONE-03", location: "Engineering Block", status: "Safe", lat: 5.760, lng: -0.222 },
  { id: "DRONE-05", location: "Dorm Building A", status: "Warning", lat: 5.762, lng: -0.225 },
];

export function EnvironmentalPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#8A1538' }}>Environmental Monitoring</h1>
        <p className="text-gray-600">Real-time campus environmental data from drone sensors</p>
      </div>

      {/* Current Readings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs">
              Safe
            </span>
          </div>
          <div className="text-sm text-green-800 mb-1">Temperature</div>
          <div className="text-3xl text-green-900 mb-2">28°C</div>
          <div className="text-xs text-green-700">Normal range: 20-32°C</div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs">
              Safe
            </span>
          </div>
          <div className="text-sm text-green-800 mb-1">CO₂ Levels</div>
          <div className="text-3xl text-green-900 mb-2">420 ppm</div>
          <div className="text-xs text-green-700">Normal range: 400-450 ppm</div>
        </div>

        <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1 bg-amber-600 text-white rounded-full text-xs">
              Warning
            </span>
          </div>
          <div className="text-sm text-amber-800 mb-1">CO Levels</div>
          <div className="text-3xl text-amber-900 mb-2">0.7 ppm</div>
          <div className="text-xs text-amber-700">Elevated, monitoring</div>
        </div>
      </div>

      {/* Campus Map */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl mb-4" style={{ color: '#8A1538' }}>Campus Drone Map</h3>

        <AshesiCampusMap markers={droneLocations} height={400} />

        {/* Legend */}
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

      {/* Environmental Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Temperature Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-[#8A1538]" />
            Temperature Trend
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={temperatureData}>
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
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* CO2 Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-[#8A1538]" />
            CO₂ Levels Trend
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={co2Data}>
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
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* CO Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#8A1538]" />
            CO Levels Trend
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={coData}>
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
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Sensors */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl mb-4" style={{ color: '#8A1538' }}>Active Sensors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {droneLocations.map((drone) => (
            <div key={drone.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono">{drone.id}</span>
                <span className={`w-2 h-2 rounded-full ${drone.status === 'Safe' ? 'bg-green-500' : 'bg-amber-500'
                  }`} />
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
