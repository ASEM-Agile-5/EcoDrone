export interface Vendor {
  id?: string;
  vendor_id?: string;
  name?: string;
  status?: "Active" | "Inactive";
  menuSynced?: boolean;
  totalOrders?: number | 0;
  lastSync?: string;
  owned_by?: string;
  vendor_contact?: string;
  owner_contact?: string;
  terms_agreed_at?: string;
  image_url?: string;
}
export interface MenuItem {
  id?: number;
  vendor_id: string | number;
  name: string;
  category_id: number;
  price: number;
  description: string;
  available?: boolean;
  image_url?: string;
}
export interface Category {
  id?: string;
  name?: string;
}


  