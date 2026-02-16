import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, MoreVertical, Store } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import React from "react";

interface Vendor {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  menuSynced: boolean;
  totalOrders: number;
  lastSync: string;
}

const initialVendors: Vendor[] = [
  {
    id: "VND-001",
    name: "Campus Café",
    status: "Active",
    menuSynced: true,
    totalOrders: 456,
    lastSync: "2026-02-12 09:30",
  },
  {
    id: "VND-002",
    name: "Bistro",
    status: "Active",
    menuSynced: true,
    totalOrders: 382,
    lastSync: "2026-02-12 08:45",
  },
  {
    id: "VND-003",
    name: "Smoothie Bar",
    status: "Active",
    menuSynced: true,
    totalOrders: 298,
    lastSync: "2026-02-12 10:15",
  },
  {
    id: "VND-004",
    name: "Pizza Corner",
    status: "Inactive",
    menuSynced: false,
    totalOrders: 124,
    lastSync: "2026-02-10 14:20",
  },
];

export function VendorsPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorActive, setNewVendorActive] = useState(true);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editVendorName, setEditVendorName] = useState("");
  const [editVendorActive, setEditVendorActive] = useState(true);

  const handleAddVendor = () => {
    if (newVendorName.trim()) {
      const newVendor: Vendor = {
        id: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
        name: newVendorName,
        status: newVendorActive ? "Active" : "Inactive",
        menuSynced: false,
        totalOrders: 0,
        lastSync: new Date().toLocaleString(),
      };
      setVendors([...vendors, newVendor]);
      setNewVendorName("");
      setNewVendorActive(true);
      setIsDialogOpen(false);
    }
  };

  const handleEditVendor = () => {
    if (editingVendor && editVendorName.trim()) {
      const updatedVendor: Vendor = {
        ...editingVendor,
        name: editVendorName,
        status: editVendorActive ? "Active" : "Inactive",
      };
      setVendors(vendors.map((v) => (v.id === editingVendor.id ? updatedVendor : v)));
      setEditingVendor(null);
      setEditVendorName("");
      setEditVendorActive(true);
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#8A1538' }}>Vendor Management</h1>
          <p className="text-gray-600">Manage food vendors and menu synchronization</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8A1538] hover:bg-[#6d1029] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>
                Enter the details of the new vendor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-name">Vendor Name</Label>
                <Input
                  id="vendor-name"
                  placeholder="Enter vendor name"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="vendor-status">Active Status</Label>
                <Switch
                  id="vendor-status"
                  checked={newVendorActive}
                  onCheckedChange={setNewVendorActive}
                />
              </div>
              <Button
                onClick={handleAddVendor}
                className="w-full bg-[#8A1538] hover:bg-[#6d1029] text-white"
              >
                Add Vendor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-sm text-gray-600">Total Vendors</div>
          <div className="text-2xl mt-1">{vendors.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-700">Active Vendors</div>
          <div className="text-2xl mt-1 text-green-700">
            {vendors.filter((v) => v.status === "Active").length}
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-700">Menu Synced</div>
          <div className="text-2xl mt-1 text-blue-700">
            {vendors.filter((v) => v.menuSynced).length}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-700">Total Orders</div>
          <div className="text-2xl mt-1 text-gray-700">
            {vendors.reduce((sum, v) => sum + v.totalOrders, 0)}
          </div>
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#8A1538]/10 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-[#8A1538]" />
                </div>
                <div>
                  <h3 className="text-lg">{vendor.name}</h3>
                  <p className="text-sm text-gray-500">{vendor.id}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingVendor(vendor);
                      setEditVendorName(vendor.name);
                      setEditVendorActive(vendor.status === "Active");
                      setIsEditDialogOpen(true);
                    }}
                  >
                    Edit Vendor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/dashboard/vendors/${vendor.id}/menu`)}>
                    View Menu
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/dashboard/vendors/${vendor.id}/orders`)}>
                    View Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => {
                      if (confirm(`Are you sure you want to deactivate ${vendor.name}?`)) {
                        setVendors(
                          vendors.map((v) =>
                            v.id === vendor.id ? { ...v, status: "Inactive" as const } : v
                          )
                        );
                      }
                    }}
                  >
                    Deactivate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${vendor.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                    }`}
                >
                  {vendor.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Menu Sync</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${vendor.menuSynced
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                    }`}
                >
                  {vendor.menuSynced ? "Synced" : "Not Synced"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="text-sm">{vendor.totalOrders}</span>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Last synced: {vendor.lastSync}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>
              Update the details of the vendor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-name">Vendor Name</Label>
              <Input
                id="vendor-name"
                placeholder="Enter vendor name"
                value={editVendorName}
                onChange={(e) => setEditVendorName(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="vendor-status">Active Status</Label>
              <Switch
                id="vendor-status"
                checked={editVendorActive}
                onCheckedChange={setEditVendorActive}
              />
            </div>
            <Button
              onClick={handleEditVendor}
              className="w-full bg-[#8A1538] hover:bg-[#6d1029] text-white"
            >
              Update Vendor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}