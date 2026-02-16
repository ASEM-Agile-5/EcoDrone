import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Package, MapPin, Clock, User } from "lucide-react";
import React from "react";

interface Order {
  id: string;
  customerName: string;
  items: string;
  total: number;
  status: "Pending" | "Preparing" | "Ready" | "Delivered" | "Cancelled";
  deliveryLocation: string;
  orderTime: string;
  droneId?: string;
}

// Mock orders data for different vendors
const mockOrdersData: { [key: string]: Order[] } = {
  "VND-001": [
    {
      id: "ORD-1245",
      customerName: "Kwame Asante",
      items: "2x Cappuccino, 1x Croissant",
      total: 30.5,
      status: "Delivered",
      deliveryLocation: "Engineering Block",
      orderTime: "2026-02-13 08:30",
      droneId: "DRN-001",
    },
    {
      id: "ORD-1258",
      customerName: "Ama Mensah",
      items: "1x Espresso",
      total: 8.5,
      status: "Preparing",
      deliveryLocation: "Library",
      orderTime: "2026-02-13 09:15",
    },
    {
      id: "ORD-1262",
      customerName: "Kofi Boateng",
      items: "3x Cappuccino, 2x Croissant",
      total: 49.0,
      status: "Ready",
      deliveryLocation: "Student Center",
      orderTime: "2026-02-13 09:45",
    },
  ],
  "VND-002": [
    {
      id: "ORD-1251",
      customerName: "Akua Owusu",
      items: "1x Caesar Salad, 1x Grilled Chicken Sandwich",
      total: 43.5,
      status: "Delivered",
      deliveryLocation: "Admin Building",
      orderTime: "2026-02-13 12:30",
      droneId: "DRN-002",
    },
    {
      id: "ORD-1265",
      customerName: "Yaw Adom",
      items: "2x Grilled Chicken Sandwich",
      total: 50.0,
      status: "Pending",
      deliveryLocation: "Sports Complex",
      orderTime: "2026-02-13 13:00",
    },
  ],
  "VND-003": [
    {
      id: "ORD-1248",
      customerName: "Esi Nyarko",
      items: "1x Mango Smoothie, 1x Green Detox",
      total: 31.5,
      status: "Delivered",
      deliveryLocation: "South Campus",
      orderTime: "2026-02-13 10:15",
      droneId: "DRN-003",
    },
    {
      id: "ORD-1267",
      customerName: "Kwabena Mensah",
      items: "2x Green Detox",
      total: 33.0,
      status: "Preparing",
      deliveryLocation: "East Campus",
      orderTime: "2026-02-13 10:45",
    },
  ],
  "VND-004": [
    {
      id: "ORD-1240",
      customerName: "Abena Osei",
      items: "1x Margherita Pizza",
      total: 28.0,
      status: "Cancelled",
      deliveryLocation: "North Campus",
      orderTime: "2026-02-12 18:30",
    },
  ],
};

const vendorNames: { [key: string]: string } = {
  "VND-001": "Campus Café",
  "VND-002": "Bistro",
  "VND-003": "Smoothie Bar",
  "VND-004": "Pizza Corner",
};

export function VendorOrdersPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [orders] = useState<Order[]>(vendorId ? mockOrdersData[vendorId] || [] : []);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const vendorName = vendorId ? vendorNames[vendorId] || "Unknown Vendor" : "Unknown Vendor";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Preparing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Ready":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "All") return true;
    return order.status === statusFilter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    preparing: orders.filter((o) => o.status === "Preparing").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/vendors")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl mb-2" style={{ color: "#8A1538" }}>
              {vendorName} - Orders
            </h1>
            <p className="text-gray-600">View all orders from this vendor</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-2xl mt-1">{stats.total}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="text-sm text-amber-700">Pending</div>
          <div className="text-2xl mt-1 text-amber-700">{stats.pending}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-700">Preparing</div>
          <div className="text-2xl mt-1 text-blue-700">{stats.preparing}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-700">Delivered</div>
          <div className="text-2xl mt-1 text-green-700">{stats.delivered}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Filter by status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538] focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#8A1538]/10 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#8A1538]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{order.id}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      {order.customerName}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Items</div>
                  <div className="text-sm">{order.items}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                  <div className="text-lg font-semibold" style={{ color: "#8A1538" }}>
                    ₵{order.total.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Delivery Location</div>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {order.deliveryLocation}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Order Time</div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {order.orderTime}
                  </div>
                </div>
                {order.droneId && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Assigned Drone</div>
                    <div className="text-sm font-medium">{order.droneId}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg mb-2" style={{ color: "#8A1538" }}>
            No orders found
          </h3>
          <p className="text-gray-600">
            {statusFilter === "All"
              ? "This vendor has no orders yet"
              : `No orders with status "${statusFilter}"`}
          </p>
        </div>
      )}
    </div>
  );
}
