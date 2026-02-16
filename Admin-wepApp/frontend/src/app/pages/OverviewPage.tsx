import { Package, PackageCheck, Clock, Radio } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { useNavigate } from "react-router";
import React from "react";

export function OverviewPage() {
  const navigate = useNavigate();

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
          value="24"
          icon={Package}
          trend={{ value: "+12% from last week", isPositive: true }}
        />
        <StatCard
          title="Pending Deliveries"
          value="8"
          icon={Clock}
          trend={{ value: "-3% from last week", isPositive: true }}
        />
        <StatCard
          title="Completed Deliveries"
          value="156"
          icon={PackageCheck}
          trend={{ value: "+18% from last week", isPositive: true }}
        />
        <StatCard
          title="Active Drones"
          value="12"
          icon={Radio}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deliveries */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4" style={{ color: '#8A1538' }}>Recent Deliveries</h3>
          <div className="space-y-4">
            {[
              { id: "ORD-2341", vendor: "Campus Café", status: "In Transit", time: "5 min ago" },
              { id: "ORD-2340", vendor: "Bistro", status: "Delivered", time: "12 min ago" },
              { id: "ORD-2339", vendor: "Smoothie Bar", status: "Preparing", time: "18 min ago" },
              { id: "ORD-2338", vendor: "Campus Café", status: "Delivered", time: "25 min ago" },
            ].map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm">{delivery.id}</div>
                  <div className="text-xs text-gray-500">{delivery.vendor}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${delivery.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      delivery.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                    }`}>
                    {delivery.status}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{delivery.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4" style={{ color: '#8A1538' }}>System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <div className="text-sm">Drone Fleet</div>
                <div className="text-xs text-gray-600 mt-1">All systems operational</div>
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

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div>
                <div className="text-sm">Weather Conditions</div>
                <div className="text-xs text-gray-600 mt-1">Moderate wind - Monitor</div>
              </div>
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <div className="text-sm">Environmental Sensors</div>
                <div className="text-xs text-gray-600 mt-1">12 sensors active</div>
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