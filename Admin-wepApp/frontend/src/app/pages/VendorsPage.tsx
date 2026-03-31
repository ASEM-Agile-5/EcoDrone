import { useState, useEffect } from "react";
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
import { getVendorsAPI, addVendorAPI, editVendorsAPI } from "../services/services";
import React from "react";

interface DisplayVendor {
  numericId: number;
  id: string;
  name: string;
  ownedBy: string;
  vendorContact: string;
  ownerContact: string;
  status: "Active" | "Inactive";
  menuSynced: boolean;
  totalOrders: number;
  lastSync: string;
}

function mapApiVendor(v: any): DisplayVendor {
  return {
    numericId: v.id,
    id: v.vendor_id,
    name: v.name,
    ownedBy: v.owned_by,
    vendorContact: v.vendor_contact,
    ownerContact: v.owner_contact,
    status: v.status as "Active" | "Inactive",
    menuSynced: (v.menu_count ?? 0) > 0,
    totalOrders: v.volume_processed ?? 0,
    lastSync: v.registration_time
      ? new Date(v.registration_time).toLocaleString()
      : "-",
  };
}

export function VendorsPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<DisplayVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorOwnedBy, setNewVendorOwnedBy] = useState("");
  const [newVendorContact, setNewVendorContact] = useState("");
  const [newOwnerContact, setNewOwnerContact] = useState("");
  const [newVendorActive, setNewVendorActive] = useState(true);
  const [addError, setAddError] = useState("");

  const [editingVendor, setEditingVendor] = useState<DisplayVendor | null>(null);
  const [editVendorName, setEditVendorName] = useState("");
  const [editVendorOwnedBy, setEditVendorOwnedBy] = useState("");
  const [editVendorContact, setEditVendorContact] = useState("");
  const [editOwnerContact, setEditOwnerContact] = useState("");
  const [editVendorActive, setEditVendorActive] = useState(true);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const data = await getVendorsAPI();
      if (data?.vendors) {
        setVendors(data.vendors.map(mapApiVendor));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async () => {
    if (!newVendorName.trim() || !newVendorOwnedBy.trim() || !newVendorContact.trim() || !newOwnerContact.trim()) {
      setAddError("All fields are required.");
      return;
    }
    setAddError("");
    try {
      const response = await addVendorAPI({
        name: newVendorName,
        owned_by: newVendorOwnedBy,
        vendor_contact: newVendorContact,
        owner_contact: newOwnerContact,
        status: newVendorActive ? "Active" : "Inactive",
      });
      if (response) {
        setNewVendorName("");
        setNewVendorOwnedBy("");
        setNewVendorContact("");
        setNewOwnerContact("");
        setNewVendorActive(true);
        setIsDialogOpen(false);
        await fetchVendors();
      }
    } catch {
      setAddError("Failed to add vendor. Please try again.");
    }
  };

  const handleEditVendor = async () => {
    if (!editingVendor) return;
    if (!editVendorName.trim() || !editVendorOwnedBy.trim() || !editVendorContact.trim() || !editOwnerContact.trim()) {
      setEditError("All fields are required.");
      return;
    }
    setEditError("");
    try {
      await editVendorsAPI(String(editingVendor.numericId), {
        name: editVendorName,
        owned_by: editVendorOwnedBy,
        vendor_contact: editVendorContact,
        owner_contact: editOwnerContact,
        status: editVendorActive ? "Active" : "Inactive",
      });
      setIsEditDialogOpen(false);
      setEditingVendor(null);
      await fetchVendors();
    } catch {
      setEditError("Failed to update vendor. Please try again.");
    }
  };

  const openEditDialog = (vendor: DisplayVendor) => {
    setEditingVendor(vendor);
    setEditVendorName(vendor.name);
    setEditVendorOwnedBy(vendor.ownedBy);
    setEditVendorContact(vendor.vendorContact);
    setEditOwnerContact(vendor.ownerContact);
    setEditVendorActive(vendor.status === "Active");
    setEditError("");
    setIsEditDialogOpen(true);
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
              <DialogDescription>Enter the details of the new vendor.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-name">Vendor Name</Label>
                <Input id="vendor-name" placeholder="Enter vendor name" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-owned-by">Owner Name</Label>
                <Input id="vendor-owned-by" placeholder="Enter owner name" value={newVendorOwnedBy} onChange={(e) => setNewVendorOwnedBy(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-contact">Vendor Contact</Label>
                <Input id="vendor-contact" placeholder="Enter vendor phone number" value={newVendorContact} onChange={(e) => setNewVendorContact(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-contact">Owner Contact</Label>
                <Input id="owner-contact" placeholder="Enter owner phone number" value={newOwnerContact} onChange={(e) => setNewOwnerContact(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="vendor-status">Active Status</Label>
                <Switch id="vendor-status" checked={newVendorActive} onCheckedChange={setNewVendorActive} />
              </div>
              {addError && <p className="text-sm text-red-600">{addError}</p>}
              <Button onClick={handleAddVendor} className="w-full bg-[#8A1538] hover:bg-[#6d1029] text-white">
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
          <div className="text-2xl mt-1 text-green-700">{vendors.filter((v) => v.status === "Active").length}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-700">Menu Synced</div>
          <div className="text-2xl mt-1 text-blue-700">{vendors.filter((v) => v.menuSynced).length}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-700">Total Orders</div>
          <div className="text-2xl mt-1 text-gray-700">{vendors.reduce((sum, v) => sum + v.totalOrders, 0)}</div>
        </div>
      </div>

      {/* Vendor Cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading vendors...</div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No vendors found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
                    <DropdownMenuItem onClick={() => openEditDialog(vendor)}>Edit Vendor</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/vendors/${vendor.numericId}/menu`)}>View Menu</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/vendors/${vendor.numericId}/orders`)}>View Orders</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={async () => {
                        if (confirm(`Are you sure you want to deactivate ${vendor.name}?`)) {
                          await editVendorsAPI(String(vendor.numericId), { ...{ name: vendor.name, owned_by: vendor.ownedBy, vendor_contact: vendor.vendorContact, owner_contact: vendor.ownerContact }, status: "Inactive" });
                          await fetchVendors();
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
                  <span className={`px-3 py-1 rounded-full text-xs ${vendor.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {vendor.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Menu Sync</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${vendor.menuSynced ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                    {vendor.menuSynced ? "Synced" : "Not Synced"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="text-sm">{vendor.totalOrders}</span>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">Registered: {vendor.lastSync}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>Update the details of the vendor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-vendor-name">Vendor Name</Label>
              <Input id="edit-vendor-name" placeholder="Enter vendor name" value={editVendorName} onChange={(e) => setEditVendorName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vendor-owned-by">Owner Name</Label>
              <Input id="edit-vendor-owned-by" placeholder="Enter owner name" value={editVendorOwnedBy} onChange={(e) => setEditVendorOwnedBy(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vendor-contact">Vendor Contact</Label>
              <Input id="edit-vendor-contact" placeholder="Enter vendor phone number" value={editVendorContact} onChange={(e) => setEditVendorContact(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-owner-contact">Owner Contact</Label>
              <Input id="edit-owner-contact" placeholder="Enter owner phone number" value={editOwnerContact} onChange={(e) => setEditOwnerContact(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-vendor-status">Active Status</Label>
              <Switch id="edit-vendor-status" checked={editVendorActive} onCheckedChange={setEditVendorActive} />
            </div>
            {editError && <p className="text-sm text-red-600">{editError}</p>}
            <Button onClick={handleEditVendor} className="w-full bg-[#8A1538] hover:bg-[#6d1029] text-white">
              Update Vendor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
