"use client";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { getUserInfoAPI } from "../services/services";
import { User } from "../models/users";

const api = axios.create({
  baseURL: "/api", // Django backend
  withCredentials: true, // ✅ crucial
});

const UserContext = createContext<{
  user: User;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refetchUser: () => Promise<void>;
} | null>(null);

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getUserInfo = async () => {
    try {
      setLoading(true);
      const userData: User = await getUserInfoAPI();
      console.log(userData);
      setLoading(false);
      setUser(userData);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        refetchUser: getUserInfo,
        setLoading: setLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
