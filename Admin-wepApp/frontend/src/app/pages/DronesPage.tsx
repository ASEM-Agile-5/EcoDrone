import { useEffect, useState } from "react";
import {
  Radio,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Plus,
  Search,
  MapPin,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import React from "react";
import { Drone } from "../models/drones";
import { addDroneAPI, editDroneAPI, getDronesAPI } from "../services/services";

export function DronesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [maxPayload, setMaxPayload] = useState("");
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Drone>>({});
  const [drones, setDrones] = useState<Drone[]>([]);
  const [addError, setAddError] = useState("");

  const mapApiDrone = (d: any): Drone => ({
    id: String(d.id),
    name: d.name,
    model: d.model ?? "—",
    maxPayload: d.max_payload ?? "—",
    status: d.status ?? "Idle",
    battery: parseInt(d.battery_level) || 0,
    location: d.current_location ?? "—",
    lastFlight: d.last_flight ? new Date(d.last_flight).toLocaleString() : "—",
    totalFlights: d.total_flights ?? 0,
  });

  const fetchDrones = async () => {
    try {
      const data = await getDronesAPI();
      if (data?.drones) setDrones(data.drones.map(mapApiDrone));
    } catch (error) {
      console.error("Error fetching drones:", error);
    }
  };

  useEffect(() => {
    fetchDrones();
  }, []);

  const handleEditDrone = async (id: string) => {
    try {
      const response = await editDroneAPI(id, name, model, maxPayload);
      if (response.status === 200) {
        setEditingDrone(null);
      }
    } catch (error) {
      console.error("Error adding drone:", error);
    }
  };
  const handleAddDrone = async () => {
    if (!name.trim()) {
      setAddError("Drone name is required.");
      return;
    }
    setAddError("");
    try {
      await addDroneAPI(name, model, maxPayload);
      setName("");
      setModel("");
      setMaxPayload("");
      setShowAddModal(false);
      await fetchDrones();
    } catch (error) {
      console.error("Error adding drone:", error);
      setAddError("Failed to add drone. Please try again.");
    }
  };

  const getBatteryIcon = (battery: number) => {
    if (battery <= 20) return <BatteryLow className="w-5 h-5 text-red-500" />;
    if (battery <= 50)
      return <BatteryMedium className="w-5 h-5 text-amber-500" />;
    if (battery < 100) return <Battery className="w-5 h-5 text-green-500" />;
    return <BatteryFull className="w-5 h-5 text-green-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border-green-200";
      case "Idle":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Charging":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Maintenance":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredDrones = drones.filter((drone) => {
    const matchesSearch =
      drone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || drone.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: drones.length,
    active: drones.filter((d) => d.status === "Active").length,
    charging: drones.filter((d) => d.status === "Charging").length,
    maintenance: drones.filter((d) => d.status === "Maintenance").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: "#8A1538" }}>
            Drone Fleet Management
          </h1>
          <p className="text-gray-600">
            Monitor and manage all EcoDrone delivery drones
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#751130] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Drone
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 text-sm">Total Drones</div>
            <Radio className="w-5 h-5 text-[#8A1538]" />
          </div>
          <div className="text-3xl" style={{ color: "#8A1538" }}>
            {stats.total}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 text-sm">Active</div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-3xl text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 text-sm">Charging</div>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
          <div className="text-3xl text-blue-600">{stats.charging}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 text-sm">Maintenance</div>
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          </div>
          <div className="text-3xl text-amber-600">{stats.maintenance}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search drones by name, ID, or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538] focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538] focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Idle">Idle</option>
            <option value="Charging">Charging</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Drones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDrones.map((drone) => (
          <div
            key={drone.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#8A1538]/10 rounded-lg flex items-center justify-center">
                  <Radio className="w-6 h-6 text-[#8A1538]" />
                </div>
                <div>
                  <h3 className="text-lg" style={{ color: "#8A1538" }}>
                    {drone.name}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {drone.id} • {drone.model}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => {
                    setEditingDrone(drone);
                    setEditFormData(drone);
                  }}
                  title="Edit drone"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => {
                    if (
                      confirm(`Are you sure you want to delete ${drone.name}?`)
                    ) {
                      setDrones((prevDrones) =>
                        prevDrones.filter((d) => d.id !== drone.id),
                      );
                    }
                  }}
                  title="Delete drone"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(
                    drone.status,
                  )}`}
                >
                  {drone.status}
                </span>
              </div>

              {/* Battery Level */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Battery Level</span>
                <div className="flex items-center gap-2">
                  {getBatteryIcon(drone.battery)}
                  <span className="text-sm">{drone.battery}%</span>
                </div>
              </div>

              {/* Battery Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    drone.battery <= 20
                      ? "bg-red-500"
                      : drone.battery <= 50
                        ? "bg-amber-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${drone.battery}%` }}
                ></div>
              </div>

              {/* Location */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Location</span>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {drone.location}
                </div>
              </div>

              {/* Last Flight */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Flight</span>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {drone.lastFlight}
                </div>
              </div>

              {/* Stats Row */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Total Flights</div>
                  <div className="text-lg" style={{ color: "#8A1538" }}>
                    {drone.totalFlights}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Max Payload</div>
                  <div className="text-lg" style={{ color: "#8A1538" }}>
                    {drone.maxPayload} kg
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDrones.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Radio className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg mb-2" style={{ color: "#8A1538" }}>
            No drones found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Add Drone Modal (Simple placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl mb-4" style={{ color: "#8A1538" }}>
              Add New Drone
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Drone Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538]"
                  placeholder="e.g., EcoDrone Theta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538]"
                >
                  <option value="">Select a model</option>
                  <option value="ED-X1">ED-X1</option>
                  <option value="ED-X2">ED-X2</option>
                  <option value="ED-X3">ED-X3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Max Payload
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538]"
                  placeholder="e.g., 2.5kg"
                  value={maxPayload}
                  onChange={(e) => setMaxPayload(e.target.value)}
                />
              </div>
            </div>
            {addError && <p className="text-sm text-red-600 mt-2">{addError}</p>}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); setAddError(""); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddDrone()}
                className="flex-1 px-4 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#751130] transition-colors"
              >
                Add Drone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Drone Modal (Simple placeholder) */}
      {editingDrone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl mb-4" style={{ color: "#8A1538" }}>
              Edit Drone
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Drone Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538]"
                  placeholder="e.g., EcoDrone Theta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538]"
                >
                  <option value="">Select a model</option>
                  <option value="ED-X1">ED-X1</option>
                  <option value="ED-X2">ED-X2</option>
                  <option value="ED-X3">ED-X3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Max Payload
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538]"
                  placeholder="e.g., 2.5kg"
                  value={maxPayload}
                  onChange={(e) => setMaxPayload(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingDrone(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditDrone(editingDrone?.id)}
                className="flex-1 px-4 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#751130] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
