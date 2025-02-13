"use client";
import React, { createContext, useState, ReactNode, useContext } from "react";

interface UserContextType {
  id: number | null;
  role: "free" | "premium" | null;
  token: string | null
  setUser: (id: number, role: "free" | "premium", userToken: string) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType>({
  id: null,
  role: null,
  setUser: () => { },
  clearUser: () => { },
  token: null
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [id, setId] = useState<number | null>(null);
  const [role, setRole] = useState<"free" | "premium" | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const setUser = (userId: number, userRole: "free" | "premium", userToken: string) => {
    setId(userId);
    setRole(userRole);
    setToken(userToken)
    console.log(userRole, userId)
  };

  const clearUser = () => {
    setId(null);
    setRole(null);
  };

  return (
    <UserContext.Provider value={{ id, role, setUser, clearUser, token }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
