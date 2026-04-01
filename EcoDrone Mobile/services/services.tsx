"use client";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MenuItem, Vendor } from "../models/vendors";

const api = axios.create({
  baseURL: "https://ecodrone-backend-dev-lwunguolhq-uc.a.run.app/",
  // baseURL: "http://localhost:8000/",
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const clearAuthToken = async () => {
  await AsyncStorage.removeItem("token");
};

export const getDashboardStatsAPI = async () => {
  try {
    const response = await api.get("dashboard/stats");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getVendorOrdersAPI = async (vendorId: string) => {
  try {
    const response = await api.post("vendors/orders", { vendor_id: vendorId });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserInfoAPI = async () => {
  try {
    const response = await api.get("user/get-user");
    // console.log(response)
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const addDroneAPI = async (
  name: string,
  model: string,
  maxPayload: string,
  droneStatus?: string,
  batteryLevel?: string,
  currentLocation?: string,
) => {
  try {
    const response = await api.post("drones/register", {
      name,
      model,
      max_payload: maxPayload,
      status: droneStatus,
      battery_level: batteryLevel,
      current_location: currentLocation,
    });

    return response;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};

export const editDroneAPI = async (
  id: string,
  name: string,
  model: string,
  maxPayload: string,
  droneStatus: string,
  batteryLevel: string,
  currentLocation: string,
) => {
  try {
    const response = await api.put(`drones/update/${id}`, {
      name,
      model,
      max_payload: maxPayload,
      status: droneStatus,
      battery_level: batteryLevel,
      current_location: currentLocation,
    });

    return response;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};
export const getCategoriesAPI = async () => {
  try {
    const response = await api.get("vendors/categories");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const getDronesAPI = async () => {
  // const token = localStorage.getItem("token");
  // if (!token) {
  //   throw new Error("Token is not present");
  // }
  try {
    const response = await api.get("drones/list");
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getVendorsAPI = async () => {
  try {
    const response = await api.get("vendors/vendors");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const editVendorsAPI = async (id: string, vendor: Vendor) => {
  try {
    const response = await api.put(`vendors/update/${id}`, vendor);
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};
export const getVendorMenuAPI = async (id: string) => {
  try {
    const response = await api.get(`vendors/menu/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteVendorMenuAPI = async (id: string) => {
  try {
    const response = await api.delete(`vendors/menu/delete/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};
export const editVendorMenuAPI = async (id: string, menu: MenuItem) => {
  try {
    const response = await api.put(`vendors/menu/update/${id}`, menu);
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};
export const addVendorMenuAPI = async (menu: MenuItem) => {
  try {
    const response = await api.post("vendors/menu/create", menu);
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};
export const addVendorAPI = async (vendor: Vendor) => {
  try {
    const response = await api.post("vendors/register", vendor);

    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};

export const getOrdersAPI = async () => {
  try {
    const response = await api.get("order/all");
    // console.log(response.data)
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getOrderDetailsAPI = async (orderId: string) => {
  try {
    const response = await api.get("order/details", {
      params: { order_id: orderId },
    });
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};

export const updateOrderDeliveryAPI = async (order: {
  order_id: string;
  status?: string;
  assigned_drone?: string | null;
}) => {
  try {
    const response = await api.post("order/set-status", order);
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};

export const getProjectsDetailsAPI = async (id: string) => {
  try {
    console.log(id);

    const response = await api.get(`projects/details/${id}`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getLocationsAPI = async () => {
  try {
    const response = await api.get("order/location-list");
    // console.log(response.data)
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const getUserOrdersAPI = async () => {
  try {
    const response = await api.get("order/user-orders");
    // console.log(response.data)
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const placeOrderAPI = async (payload: {
  vendor: number;
  timestamp: string;
  location: string;
  total_amount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}) => {
  try {
    const response = await api.post("order/place-order", payload);
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};

export const loginAPI = async (email: string, password: string) => {
  try {
    const response = await api.post("user/login", {
      email: email,
      password: password,
    });

    const token = response.data?.token;
    if (token) {
      await AsyncStorage.setItem("token", token);
    }

    return response;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};

export const signUpAPI = async (data: {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  username: string;
  terms_accepted: boolean;
}) => {
  const response = await api.post("user/register", data);
  return response;
};
