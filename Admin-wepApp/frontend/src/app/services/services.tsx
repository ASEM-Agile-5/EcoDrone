import axios from "axios";
import { LoginResponse, User } from "../models/users";
import { MenuItem, Vendor } from "../models/vendors";
// import { NextResponse } from "next/server";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

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
) => {
  console.log(name, model, maxPayload);
  try {
    const response = await api.post("drones/register", {
      name: name,
      model: model,
      maxPayload: maxPayload,
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
) => {
  console.log(name, model, maxPayload);
  try {
    const response = await api.put(`drones/update/${id}`, {
      name: name,
      model: model,
      maxPayload: maxPayload,
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
    // console.log(response.data)
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
export const editVendorMenuAPI = async (id: string, menu: MenuItem) => {
  try {
    const response = await api.put(`vendors/menu/${id}`, menu);
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
    const response = await api.post("vendors/menu/create/", menu);
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

export const getProjectsDetailsAPI = async (id: string) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token is not present");
  }
  try {
    console.log(id);

    const response = await api.get(`projects/details/${id}`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const loginAPI = async (email: string, password: string) => {
  try {
    const response = await api.post("user/login", {
      email: email,
      password: password,
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
