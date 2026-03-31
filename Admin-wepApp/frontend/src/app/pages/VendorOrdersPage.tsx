import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Package, MapPin, Clock, User } from "lucide-react";
import { getVendorsAPI, getVendorOrdersAPI } from "../services/services";
import React from "react";

interface DisplayOrder {
  id: string;
  customerName: string;
  items: string;
  total: number;
  status: string;
  deliveryLocation: string;
  orderTime: string;
  droneId?: string;
}

function normalizeStatus(s: string): string {
  switch (s?.toLowerCase()) {
    case "in progress": return "In Progress";
    case "pending": return "Pending";
    case "completed": return "Completed";
    case "failed": return "Failed";
    default: return s ?? "—";
  }
}

function mapApiOrder(order: any): DisplayOrder {
  const itemsSummary = Array.isArray(order.items)
    ? order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")
    : order.items ?? "";

  return {
    id: order.order_id,
    customerName: order.customerName ?? "—",
    items: itemsSummary,
    total: order.totalAmount ?? 0,
    status: normalizeStatus(order.status),
    deliveryLocation: order.location ?? "—",
    orderTime: order.timestamp ?? "—",
    droneId: order.drone && order.drone !== "None" ? order.drone : undefined,
  };
}

export function VendorOrdersPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();

  const [vendorName, setVendorName] = useState("");
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    if (!vendorId) return;
    fetchVendorName();
    fetchOrders();
  }, [vendorId]);

  const fetchVendorName = async () => {
    try {
      const data = await getVendorsAPI();
      if (data?.vendors) {
        const vendor = data.vendors.find((v: any) => String(v.id) === vendorId);
        setVendorName(vendor?.name ?? "Unknown Vendor");
      }
    } catch {
      setVendorName("Unknown Vendor");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getVendorOrdersAPI(vendorId!);
      if (Array.isArray(data)) {
        setOrders(data.map(mapApiOrder));
      } else if (data?.message) {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Failed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredOrders = orders.filter((order) =>
    statusFilter === "All" ? true : order.status === statusFilter
  );

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    inProgress: orders.filter((o) => o.status === "In Progress").length,
    completed: orders.filter((o) => o.status === "Completed").length,
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
              {vendorName || "Loading..."} — Orders
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
          <div className="text-sm text-blue-700">In Progress</div>
          <div className="text-2xl mt-1 text-blue-700">{stats.inProgress}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-700">Completed</div>
          <div className="text-2xl mt-1 text-green-700">{stats.completed}</div>
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
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading orders...</div>
      ) : filteredOrders.length > 0 ? (
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
                <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Items</div>
                  <div className="text-sm">{order.items || "—"}</div>
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
          <h3 className="text-lg mb-2" style={{ color: "#8A1538" }}>No orders found</h3>
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
