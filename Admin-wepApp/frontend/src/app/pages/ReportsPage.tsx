import { Download, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import React from "react";

const vendorData = [
  { name: "Campus Café", deliveries: 456 },
  { name: "Bistro", deliveries: 382 },
  { name: "Smoothie Bar", deliveries: 298 },
  { name: "Pizza Corner", deliveries: 124 },
];

const weeklyData = [
  { day: "Mon", deliveries: 45 },
  { day: "Tue", deliveries: 52 },
  { day: "Wed", deliveries: 48 },
  { day: "Thu", deliveries: 61 },
  { day: "Fri", deliveries: 72 },
  { day: "Sat", deliveries: 38 },
  { day: "Sun", deliveries: 29 },
];

export function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#8A1538' }}>Weekly Reports</h1>
          <p className="text-gray-600">Delivery analytics and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#8A1538] text-[#8A1538] hover:bg-[#8A1538] hover:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button className="bg-[#8A1538] hover:bg-[#6d1029] text-white">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-sm text-gray-600">Total Deliveries (Week)</div>
          <div className="text-2xl mt-1">345</div>
          <div className="text-xs text-green-600 mt-2">+15% vs last week</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-sm text-gray-600">Avg. Delivery Time</div>
          <div className="text-2xl mt-1">12 min</div>
          <div className="text-xs text-green-600 mt-2">-2 min improvement</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-2xl mt-1">98.5%</div>
          <div className="text-xs text-green-600 mt-2">+0.5% vs last week</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-sm text-gray-600">Peak Hour</div>
          <div className="text-2xl mt-1">12-1 PM</div>
          <div className="text-xs text-gray-500 mt-2">Lunch period</div>
        </div>
      </div>

      {/* Vendor Performance Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-xl mb-1" style={{ color: '#8A1538' }}>Total Deliveries by Vendor</h3>
          <p className="text-sm text-gray-600">Cumulative deliveries per vendor this week</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vendorData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="deliveries" fill="#8A1538" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-xl mb-1" style={{ color: '#8A1538' }}>Weekly Delivery Trends</h3>
          <p className="text-sm text-gray-600">Daily delivery volume over the past week</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="deliveries"
              stroke="#8A1538"
              strokeWidth={3}
              dot={{ fill: "#8A1538", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4" style={{ color: '#8A1538' }}>Top Delivery Locations</h3>
          <div className="space-y-3">
            {[
              { location: "Dorm Building A", count: 67 },
              { location: "Engineering Block", count: 54 },
              { location: "Library", count: 48 },
              { location: "Sports Complex", count: 42 },
              { location: "Student Center", count: 39 },
            ].map((item, index) => (
              <div key={item.location} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#8A1538] text-white rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                  <span className="text-sm">{item.location}</span>
                </div>
                <span className="text-sm">{item.count} deliveries</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4" style={{ color: '#8A1538' }}>Drone Utilization</h3>
          <div className="space-y-3">
            {[
              { drone: "DRONE-05", usage: 92 },
              { drone: "DRONE-03", usage: 88 },
              { drone: "DRONE-08", usage: 85 },
              { drone: "DRONE-02", usage: 81 },
              { drone: "DRONE-07", usage: 76 },
            ].map((item) => (
              <div key={item.drone} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono">{item.drone}</span>
                  <span>{item.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#8A1538] h-2 rounded-full transition-all"
                    style={{ width: `${item.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
