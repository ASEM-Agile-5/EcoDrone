import { useEffect, useState } from "react";
import { Search, Filter, Download, Edit, Eye, X } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import React from "react";
import { getOrdersAPI, getDronesAPI } from "../services/services";
import { Order } from "../models/order";

export function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [availableDrones, setAvailableDrones] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editDrone, setEditDrone] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setProjectsLoading(true);
        const data = await getOrdersAPI();
        setDeliveries(data || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setDeliveries([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    const fetchDrones = async () => {
      try {
        const data = await getDronesAPI();
        if (data?.drones) {
          setAvailableDrones(data.drones.map((d: any) => d.name));
        }
      } catch (error) {
        console.error("Failed to fetch drones:", error);
      }
    };

    fetchOrders();
    fetchDrones();
  }, []);

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesStatus =
      statusFilter === "all" || delivery.status === statusFilter;
    const matchesSearch =
      delivery.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-purple-100 text-purple-700";
      case "In Progress":
        return "bg-amber-100 text-amber-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleEdit = (delivery: Order) => {
    setEditingOrder(delivery);
    setEditStatus(delivery.status);
    // setEditDrone(delivery.drone);
  };

  const handleSave = () => {
    if (editingOrder) {
      // Set drone to "None" if status is "Waiting"
      const updatedDrone = editStatus === "Waiting" ? "None" : editDrone;

      const updatedDeliveries = deliveries.map((delivery) =>
        delivery.order_id === editingOrder.order_id
          ? { ...delivery, status: editStatus, drone: updatedDrone }
          : delivery,
      );
      setDeliveries(updatedDeliveries);
      setEditingOrder(null);
    }
  };

  const handleCancel = () => {
    setEditingOrder(null);
  };

  const handleView = (delivery: Order) => {
    setViewingOrder(delivery);
  };

  const handleCloseView = () => {
    setViewingOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: "#8A1538" }}>
            Delivery Management
          </h1>
          <p className="text-gray-600">Track and manage all drone deliveries</p>
        </div>
        <Button className="bg-[#8A1538] hover:bg-[#6d1029] text-white">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by Order ID, Vendor, or Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-sm text-gray-600">Total Today</div>
          <div className="text-2xl mt-1">{deliveries.length}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-700">Pending</div>
          <div className="text-2xl mt-1 text-purple-700">
            {deliveries.filter((d) => d.status === "Pending").length}
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="text-sm text-amber-700">In Progress</div>
          <div className="text-2xl mt-1 text-amber-700">
            {deliveries.filter((d) => d.status === "In Progress").length}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-700">Completed</div>
          <div className="text-2xl mt-1 text-green-700">
            {deliveries.filter((d) => d.status === "Completed").length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Order ID</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Delivery Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Drone</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeliveries.map((delivery) => (
              <TableRow key={delivery.order_id} className="hover:bg-gray-50">
                <TableCell className="font-mono text-sm">
                  {delivery.order_id}
                </TableCell>
                <TableCell>{delivery.vendor}</TableCell>
                <TableCell>{delivery.location}</TableCell>
                <TableCell>
                  {editingOrder &&
                  editingOrder.order_id === delivery.order_id ? (
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${getStatusColor(delivery.status)}`}
                    >
                      {delivery.status}
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {editingOrder &&
                  editingOrder.order_id === delivery.order_id &&
                  delivery.status !== "Completed" ? (
                    <Select value={editDrone} onValueChange={setEditDrone}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select drone" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDrones.map((drone) => (
                          <SelectItem key={drone} value={drone}>
                            {drone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    delivery.drone
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {delivery.timestamp}
                </TableCell>
                <TableCell>
                  {editingOrder &&
                  editingOrder.order_id === delivery.order_id ? (
                    <div className="flex gap-2">
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                      <Button
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="bg-[#8A1538] hover:bg-[#6d1029] text-white"
                        onClick={() => handleEdit(delivery)}
                        title="Edit order"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                        onClick={() => handleView(delivery)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl" style={{ color: "#8A1538" }}>
                Order Details
              </h2>
              <Button
                className="bg-gray-500 hover:bg-gray-600 text-white p-2"
                onClick={handleCloseView}
                title="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-mono">{viewingOrder.order_id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(viewingOrder.status)}`}
                  >
                    {viewingOrder.status}
                  </span>
                </div>
              </div>

              <div className="border-t pt-3">
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: "#8A1538" }}
                >
                  Vendor Information
                </h3>
                <p className="text-sm">
                  <span className="text-gray-500">Vendor:</span>{" "}
                  {viewingOrder.vendor}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Delivery Location:</span>{" "}
                  {viewingOrder.location}
                </p>
              </div>

              <div className="border-t pt-3">
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: "#8A1538" }}
                >
                  Customer Information
                </h3>
                <p className="text-sm">
                  <span className="text-gray-500">Name:</span>{" "}
                  {viewingOrder.customerName}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Phone:</span>{" "}
                  {viewingOrder.customerPhone}
                </p>
              </div>

              <div className="border-t pt-3">
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: "#8A1538" }}
                >
                  Delivery Information
                </h3>
                <p className="text-sm">
                  <span className="text-gray-500">Assigned Drone:</span>{" "}
                  {viewingOrder.drone}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Timestamp:</span>{" "}
                  {viewingOrder.timestamp}
                </p>
              </div>

              <div className="border-t pt-3">
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: "#8A1538" }}
                >
                  Order Items
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {viewingOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-sm font-mono">
                        ₵{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-mono">
                      ₵{viewingOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Delivery Fee:</span>
                    <span className="text-sm font-mono">
                      ₵{viewingOrder.deliveryFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-sm font-semibold">Total:</span>
                    <span className="text-sm font-mono font-semibold">
                      ₵
                      {(
                        viewingOrder.totalAmount + viewingOrder.deliveryFee
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {viewingOrder.specialInstructions && (
                <div className="border-t pt-3">
                  <h3
                    className="text-sm font-semibold mb-2"
                    style={{ color: "#8A1538" }}
                  >
                    Special Instructions
                  </h3>
                  <p className="text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                    {viewingOrder.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
