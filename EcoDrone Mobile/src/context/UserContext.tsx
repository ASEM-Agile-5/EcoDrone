import React, { createContext, useContext, useState } from "react";
import { getUserInfoAPI } from "services/services";

interface User {
  first_name: string;
  last_name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  userId: string | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setUserId: (id: string) => void;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refetchUser = async () => {
    setLoading(true);
    try {
      const data = await getUserInfoAPI();
      setUser(data ?? null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, userId, loading, setLoading, setUserId, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
