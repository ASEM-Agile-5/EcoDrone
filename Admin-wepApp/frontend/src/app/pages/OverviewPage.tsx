import { useEffect, useState } from "react";
import { Package, PackageCheck, Clock, Radio } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { useNavigate } from "react-router";
import { getDashboardStatsAPI, getOrdersAPI } from "../services/services";
import React from "react";

export function OverviewPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_active_orders: 0, active_drones: 0 });
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    getDashboardStatsAPI().then((data) => {
      if (data) setStats(data);
    });
    getOrdersAPI().then((data) => {
      if (Array.isArray(data)) setOrders(data);
    });
  }, []);

  const pendingCount = orders.filter((o) => o.status === "Waiting").length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;
  const recentOrders = [...orders].reverse().slice(0, 4);

  const getStatusColor = (status: string) => {
    if (status === "Completed") return "bg-green-100 text-green-700";
    if (status === "In Transit") return "bg-blue-100 text-blue-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#8A1538' }}>Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to the EcoDrone Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Active Deliveries"
          value={String(stats.total_active_orders)}
          icon={Package}
        />
        <StatCard
          title="Pending Deliveries"
          value={String(pendingCount)}
          icon={Clock}
        />
        <StatCard
          title="Completed Deliveries"
          value={String(completedCount)}
          icon={PackageCheck}
        />
        <StatCard
          title="Active Drones"
          value={String(stats.active_drones)}
          icon={Radio}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deliveries */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4" style={{ color: '#8A1538' }}>Recent Deliveries</h3>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No recent deliveries.</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.order_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm">{order.order_id}</div>
                    <div className="text-xs text-gray-500">{order.vendor}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{order.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4" style={{ color: '#8A1538' }}>System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <div className="text-sm">Drone Fleet</div>
                <div className="text-xs text-gray-600 mt-1">{stats.active_drones} drones active</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <div className="text-sm">GPS & Navigation</div>
                <div className="text-xs text-gray-600 mt-1">Signal strength: Excellent</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <div className="text-sm">Environmental Sensors</div>
                <div className="text-xs text-gray-600 mt-1">All sensors active</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="mb-4" style={{ color: '#8A1538' }}>Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#8A1538] hover:bg-gray-50 transition-colors text-left" onClick={() => navigate('/dashboard/deliveries')}>
            <Package className="w-6 h-6 text-[#8A1538] mb-2" />
            <div className="text-sm">View All Deliveries</div>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#8A1538] hover:bg-gray-50 transition-colors text-left" onClick={() => navigate('/dashboard/drones')}>
            <Radio className="w-6 h-6 text-[#8A1538] mb-2" />
            <div className="text-sm">Drone Status</div>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#8A1538] hover:bg-gray-50 transition-colors text-left" onClick={() => navigate('/dashboard/reports')}>
            <PackageCheck className="w-6 h-6 text-[#8A1538] mb-2" />
            <div className="text-sm">Generate Report</div>
          </button>
        </div>
      </div>
    </div>
  );
}
