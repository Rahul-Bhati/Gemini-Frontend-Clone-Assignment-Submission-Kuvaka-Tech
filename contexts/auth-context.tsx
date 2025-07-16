"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  phone: string
  countryCode: string
  name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (phone: string, countryCode: string, otp: string) => Promise<boolean>
  signup: (phone: string, countryCode: string, name: string, otp: string) => Promise<boolean>
  logout: () => void
  sendOTP: (phone: string, countryCode: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const sendOTP = async (phone: string, countryCode: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${countryCode}${phone}`,
        })
        resolve(true)
      }, 1000)
    })
  }

  const login = async (phone: string, countryCode: string, otp: string): Promise<boolean> => {
    // Simulate OTP validation (accept any 6-digit code)
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      })
      return false
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = {
          id: Date.now().toString(),
          phone,
          countryCode,
        }
        setUser(userData);
        console.log("user => ", user);
        localStorage.setItem("user", JSON.stringify(userData))
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        })
        resolve(true)
      }, 1500)
    })
  }

  const signup = async (phone: string, countryCode: string, name: string, otp: string): Promise<boolean> => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      })
      return false
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = {
          id: Date.now().toString(),
          phone,
          countryCode,
          name,
        }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        toast({
          title: "Account Created",
          description: "Welcome to Gemini Chat!",
        })
        resolve(true)
      }, 1500)
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("chatrooms")
    localStorage.removeItem("messages")
    toast({
      title: "Logged Out",
      description: "See you next time!",
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, sendOTP }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
