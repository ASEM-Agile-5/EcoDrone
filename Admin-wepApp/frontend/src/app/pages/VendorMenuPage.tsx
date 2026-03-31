import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, Edit, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  getVendorsAPI,
  getVendorMenuAPI,
  addVendorMenuAPI,
  editVendorMenuAPI,
  deleteVendorMenuAPI,
} from "../services/services";
import React from "react";

interface DisplayMenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
  imageUrl: string;
}

function mapApiMenuItem(item: any): DisplayMenuItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category ?? "",
    price: parseFloat(item.price),
    description: item.description,
    available: item.status === "Active",
    imageUrl: item.image_url ?? "",
  };
}

export function VendorMenuPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();

  const [vendorName, setVendorName] = useState("");
  const [menuItems, setMenuItems] = useState<DisplayMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<DisplayMenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (vendorId) {
      fetchVendorName();
      fetchMenu();
    }
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

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const data = await getVendorMenuAPI(vendorId!);
      if (Array.isArray(data)) {
        setMenuItems(data.map(mapApiMenuItem));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!formData.name.trim() || !formData.price) {
      setFormError("Name and price are required.");
      return;
    }
    setFormError("");
    try {
      await addVendorMenuAPI({
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        image_url: formData.imageUrl || null,
        vendor_id: vendorId ? parseInt(vendorId) : null,
      });
      setFormData({ name: "", price: "", description: "", imageUrl: "" });
      setShowAddDialog(false);
      await fetchMenu();
    } catch {
      setFormError("Failed to add item. Please try again.");
    }
  };

  const handleEditItem = async () => {
    if (!editingItem) return;
    if (!formData.name.trim() || !formData.price) {
      setFormError("Name and price are required.");
      return;
    }
    setFormError("");
    try {
      await editVendorMenuAPI(String(editingItem.id), {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        image_url: formData.imageUrl || null,
      });
      setFormData({ name: "", price: "", description: "", imageUrl: "" });
      setEditingItem(null);
      setShowEditDialog(false);
      await fetchMenu();
    } catch {
      setFormError("Failed to update item. Please try again.");
    }
  };

  const handleDeleteItem = async (item: DisplayMenuItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteVendorMenuAPI(String(item.id));
        await fetchMenu();
      } catch {
        alert("Failed to delete item.");
      }
    }
  };

  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

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
              {vendorName || "Loading..."} — Menu
            </h1>
            <p className="text-gray-600">Manage menu items for this vendor</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setFormData({ name: "", price: "", description: "", imageUrl: "" });
            setFormError("");
            setShowAddDialog(true);
          }}
          className="bg-[#8A1538] hover:bg-[#6d1029] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-sm text-gray-600">Total Items</div>
          <div className="text-2xl mt-1">{menuItems.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-700">Available</div>
          <div className="text-2xl mt-1 text-green-700">
            {menuItems.filter((item) => item.available).length}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-700">Categories</div>
          <div className="text-2xl mt-1 text-gray-700">{categories.length}</div>
        </div>
      </div>

      {/* Menu Items */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading menu...</div>
      ) : categories.length > 0 ? (
        categories.map((category) => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl" style={{ color: "#8A1538" }}>
              {category || "Uncategorized"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    {item.imageUrl && (
                      <div className="mb-4 -mx-6 -mt-6">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-t-xl"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#8A1538]/10 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-[#8A1538]" />
                        </div>
                        <h3 className="font-medium">{item.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setFormData({
                              name: item.name,
                              price: item.price.toString(),
                              description: item.description,
                              imageUrl: item.imageUrl,
                            });
                            setFormError("");
                            setShowEditDialog(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit item"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-lg font-semibold" style={{ color: "#8A1538" }}>
                        ₵{item.price.toFixed(2)}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          item.available
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg mb-2" style={{ color: "#8A1538" }}>
            No menu items yet
          </h3>
          <p className="text-gray-600">Add your first menu item to get started</p>
        </div>
      )}

      {/* Add Menu Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>Add a new item to {vendorName}'s menu.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input id="item-name" placeholder="e.g., Cappuccino" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price">Price (₵)</Label>
              <Input id="item-price" type="number" step="0.50" placeholder="e.g., 12.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-description">Description</Label>
              <Input id="item-description" placeholder="Brief description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-image-url">Image URL (optional)</Label>
              <Input id="item-image-url" placeholder="https://..." value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <Button onClick={handleAddItem} className="w-full bg-[#8A1538] hover:bg-[#6d1029] text-white">
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update the menu item details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item-name">Item Name</Label>
              <Input id="edit-item-name" placeholder="e.g., Cappuccino" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-price">Price (₵)</Label>
              <Input id="edit-item-price" type="number" step="0.50" placeholder="e.g., 12.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-description">Description</Label>
              <Input id="edit-item-description" placeholder="Brief description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-image-url">Image URL (optional)</Label>
              <Input id="edit-item-image-url" placeholder="https://..." value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <Button onClick={handleEditItem} className="w-full bg-[#8A1538] hover:bg-[#6d1029] text-white">
              Update Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
