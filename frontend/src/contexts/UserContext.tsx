"use client";
import React, { createContext, useState, ReactNode, useContext } from "react";

interface UserContextType {
  id: number | null;
  role: "docente" | "discente" | null;
  setUser: (id: number, role: "docente" | "discente") => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType>({
  id: null,
  role: null,
  setUser: () => {},
  clearUser: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [id, setId] = useState<number | null>(null);
  const [role, setRole] = useState<"docente" | "discente" | null>(null);

  const setUser = (userId: number, userRole: "docente" | "discente") => {
    setId(userId);
    setRole(userRole);
  };

  const clearUser = () => {
    setId(null);
    setRole(null);
  };

  return (
    <UserContext.Provider value={{ id, role, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);