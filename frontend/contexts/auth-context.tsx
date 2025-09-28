"use client"

import { Account } from "@/interfaces/Account"
import { loginEmailService, logoutAccount, registerEmailService } from "@/services/AuthenticationService"
import { randomUUID } from "crypto"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  account: Account | null
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  isLoading: boolean,
  loggedIn: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const savedAccount = localStorage.getItem("account");
    if (savedAccount && savedAccount !== "undefined") {
      setAccount(JSON.parse(savedAccount))
      setLoggedIn(true)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await loginEmailService(email, password);
      console.log(response);
      setAccount(response);
      localStorage.setItem("account", JSON.stringify(response));
      setLoggedIn(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const register = async (fullName: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await registerEmailService(email, password, fullName);
      console.log(response);
      setAccount(response);
      localStorage.setItem("account", JSON.stringify(response));
      setLoggedIn(true);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockAccount = {
      id: randomUUID(),
      email: "john.doe@gmail.com",
      password: "password",
      address: "123 Main St",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setAccount(mockAccount)
    localStorage.setItem("account", JSON.stringify(mockAccount))
    setLoggedIn(true)
    setIsLoading(false)
  }

  const logout = async () => {
    await logoutAccount();
    setAccount(null)
    localStorage.removeItem("account");
    localStorage.removeItem("profile");
    setLoggedIn(false)
  }

  return (
    <AuthContext.Provider
      value={{
        account,
        login,
        register,
        loginWithGoogle,
        logout,
        isLoading,
        loggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
