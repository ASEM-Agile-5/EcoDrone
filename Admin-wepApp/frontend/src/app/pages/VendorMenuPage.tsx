import { useEffect, useState } from "react";
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
import React from "react";
import { Category, MenuItem } from "../models/vendors";
import {
  addVendorMenuAPI,
  getCategoriesAPI,
  getVendorMenuAPI,
} from "../services/services";

// Mock menu data for different vendors
const mockMenuData: { [key: string]: MenuItem[] } = {
  "VND-001": [
    {
      id: "ITEM-001",
      name: "Espresso",
      category: "Beverages",
      price: 8.5,
      description: "Strong and rich espresso shot",
      available: true,
      imageUrl:
        "https://images.unsplash.com/photo-1645445644664-8f44112f334c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3NzA5NzIyNzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "ITEM-002",
      name: "Cappuccino",
      category: "Beverages",
      price: 12.0,
      description: "Classic Italian coffee with steamed milk",
      available: true,
      imageUrl:
        "https://images.unsplash.com/photo-1667388363683-a07bbf0c84b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBwdWNjaW5vJTIwY29mZmVlJTIwbGF0dGUlMjBhcnR8ZW58MXx8fHwxNzcwOTYxMzE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "ITEM-003",
      name: "Croissant",
      category: "Pastries",
      price: 6.5,
      description: "Buttery and flaky French pastry",
      available: true,
      imageUrl:
        "https://images.unsplash.com/photo-1675125530520-cbd142b630b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9pc3NhbnQlMjBwYXN0cnklMjBmcmVuY2h8ZW58MXx8fHwxNzcwOTc2NzM5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ],
  "VND-002": [
    {
      id: "ITEM-004",
      name: "Caesar Salad",
      category: "Salads",
      price: 18.5,
      description: "Fresh romaine with classic Caesar dressing",
      available: true,
      imageUrl:
        "https://images.unsplash.com/photo-1739436776460-35f309e3f887?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWVzYXIlMjBzYWxhZCUyMGZyZXNofGVufDF8fHx8MTc3MDk2MDQzNXww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "ITEM-005",
      name: "Grilled Chicken Sandwich",
      category: "Mains",
      price: 25.0,
      description: "Grilled chicken with lettuce and tomato",
      available: true,
      imageUrl:
        "https://images.unsplash.com/photo-1597579018905-8c807adfbed4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMHNhbmR3aWNofGVufDF8fHx8MTc3MDk2NTk0OHww&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ],
  "VND-003": [
    {
      id: "ITEM-006",
      name: "Mango Smoothie",
      category: "Smoothies",
      price: 15.0,
      description: "Fresh mango blended with yogurt",
      available: true,
      imageUrl:
        "https://images.unsplash.com/photo-1575159240102-4331f59433ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5nbyUyMHNtb290aGllJTIwZHJpbmt8ZW58MXx8fHwxNzcwOTM1NzU5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "ITEM-007",
      name: "Green Detox",
      category: "Smoothies",
      price: 16.5,
      description: "Spinach, kale, and green apple",
      available: true,
      imageUrl:
        "https://images.unsplash.com/photo-1588465967258-636b1c445f4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHNtb290aGllJTIwZGV0b3h8ZW58MXx8fHwxNzcwOTc2NzQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ],
  "VND-004": [
    {
      id: "ITEM-008",
      name: "Margherita Pizza",
      category: "Pizza",
      price: 28.0,
      description: "Classic tomato and mozzarella",
      available: false,
      imageUrl:
        "https://images.unsplash.com/photo-1680405620826-83b0f0f61b28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJnaGVyaXRhJTIwcGl6emElMjBpdGFsaWFufGVufDF8fHx8MTc3MDk3Njc0MXww&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ],
};
const vendorNames: { [key: string]: string } = {
  "VND-001": "Campus Café",
  "VND-002": "Bistro",
  "VND-003": "Smoothie Bar",
  "VND-004": "Pizza Corner",
};

export function VendorMenuPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    imageUrl: "",
  });

  const fetchMenuItems = async () => {
    if (!vendorId) return;
    try {
      const data = await getVendorMenuAPI(vendorId);
      setMenuItems(data || []);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      setMenuItems([]);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [vendorId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesAPI();
        setCategories(data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const vendorName = vendorId
    ? vendorNames[vendorId] || "Unknown Vendor"
    : "Unknown Vendor";

  const handleAddItem = async () => {
    if (formData.name.trim() && formData.price) {
      const newItem = {
        vendor_id: parseInt(vendorId!) || 0,
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        image_url: formData.imageUrl,
        category_id: parseInt(formData.category) || 0,
      };
      try {
        const result = await addVendorMenuAPI(newItem);
        console.log("Menu item added:", result);
        setShowAddDialog(false);
        setFormData({
          name: "",
          category: "",
          price: "",
          description: "",
          imageUrl: "",
        });
        await fetchMenuItems();
      } catch (error) {
        console.error("Failed to add menu item:", error);
      }
    }
  };

  const handleEditItem = () => {
    if (editingItem && formData.name.trim() && formData.price) {
      const updatedItem: MenuItem = {
        ...editingItem,
        name: formData.name,
        category_id: parseInt(formData.category) || 0,
        price: parseFloat(formData.price),
        description: formData.description,
        image_url: formData.imageUrl,
      };
      setMenuItems(
        menuItems.map((item) =>
          item.id === editingItem.id ? updatedItem : item,
        ),
      );
      setFormData({
        name: "",
        category: "",
        price: "",
        description: "",
        imageUrl: "",
      });
      setEditingItem(null);
      setShowEditDialog(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      setMenuItems(menuItems.filter((item) => item.id !== itemId));
    }
  };

  const toggleAvailability = (itemId: string) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item,
      ),
    );
  };

  const menuCategories = Array.from(
    new Set(menuItems.map((item) => item.category_id)),
  );

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
              {vendorName} - Menu
            </h1>
            <p className="text-gray-600">Manage menu items for this vendor</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setFormData({
              name: "",
              category: "",
              price: "",
              description: "",
              imageUrl: "",
            });
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
          <div className="text-2xl mt-1 text-gray-700">
            {menuCategories.length}
          </div>
        </div>
      </div>

      {/* Menu Items by Category */}
      {menuCategories.length > 0 ? (
        menuCategories.map((category) => (
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
                    {/* Item Image */}
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
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setFormData({
                              name: item.name,
                              category: item.category,
                              price: item.price.toString(),
                              description: item.description,
                              imageUrl: item.imageUrl || "",
                            });
                            setShowEditDialog(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit item"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div
                        className="text-lg font-semibold"
                        style={{ color: "#8A1538" }}
                      >
                        ₵{item.price}
                      </div>
                      <button
                        onClick={() => toggleAvailability(item.id)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          item.available
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </button>
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
          <p className="text-gray-600">
            Add your first menu item to get started
          </p>
        </div>
      )}

      {/* Add Menu Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>
              Add a new item to the vendor's menu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                placeholder="e.g., Cappuccino"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <select
                id="item-category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price">Price (₵)</Label>
              <Input
                id="item-price"
                type="number"
                step="0.50"
                placeholder="e.g., 12.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-description">Description</Label>
              <Input
                id="item-description"
                placeholder="Brief description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-image-url">Image URL</Label>
              <Input
                id="item-image-url"
                placeholder="URL of the item image"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>
            <Button
              onClick={handleAddItem}
              className="w-full bg-[#8A1538] hover:bg-[#6d1029] text-white"
            >
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
              <Input
                id="edit-item-name"
                placeholder="e.g., Cappuccino"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-category">Category</Label>
              <select
                id="edit-item-category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-price">Price (₵)</Label>
              <Input
                id="edit-item-price"
                type="number"
                step="0.50"
                placeholder="e.g., 12.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-description">Description</Label>
              <Input
                id="edit-item-description"
                placeholder="Brief description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-image-url">Image URL</Label>
              <Input
                id="edit-item-image-url"
                placeholder="URL of the item image"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>
            <Button
              onClick={handleEditItem}
              className="w-full bg-[#8A1538] hover:bg-[#6d1029] text-white"
            >
              Update Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
