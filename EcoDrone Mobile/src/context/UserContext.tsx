import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getUserInfoAPI } from "services/services";

interface User {
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  userId: string | null;
  loading: boolean;
  authReady: boolean;
  isAuthenticated: boolean;
  setLoading: (loading: boolean) => void;
  setUserId: (id: string | null) => void;
  refetchUser: () => Promise<void>;
  restoreSession: () => Promise<void>;
  completeLogin: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refetchUser = useCallback(async () => {
    const data = await getUserInfoAPI();
    if (!data) {
      setUser(null);
      setUserId(null);
      setIsAuthenticated(false);
      throw new Error("Failed to load user");
    }

    setUser(data);
    setUserId(data.user_id ?? null);
    setIsAuthenticated(true);
  }, []);

  const restoreSession = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setUser(null);
        setUserId(null);
        setIsAuthenticated(false);
        return;
      }

      try {
        await refetchUser();
      } catch {
        await AsyncStorage.removeItem("token");
        setUser(null);
        setUserId(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
      setAuthReady(true);
    }
  }, [refetchUser]);

  const completeLogin = useCallback(
    async (nextUserId: string) => {
      setAuthReady(true);
      setIsAuthenticated(true);
      setUserId(nextUserId);
      setLoading(true);
      try {
        await refetchUser();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    },
    [refetchUser],
  );

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
    setUserId(null);
    setIsAuthenticated(false);
    setAuthReady(true);
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const refetchUserWithLoading = useCallback(async () => {
    setLoading(true);
    try {
      await refetchUser();
    } finally {
      setLoading(false);
    }
  }, [refetchUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        userId,
        loading,
        authReady,
        isAuthenticated,
        setLoading,
        setUserId,
        refetchUser: refetchUserWithLoading,
        restoreSession,
        completeLogin,
        logout,
      }}
    >
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
