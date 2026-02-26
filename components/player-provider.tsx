"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"

interface PlayerData {
  name: string
  age: number
}

interface PlayerContextValue {
  player: PlayerData | null
  isRegistered: boolean
  showRegistration: boolean
  setShowRegistration: (show: boolean) => void
  register: (name: string, age: number) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider")
  return ctx
}

const STORAGE_KEY = "ndl-arcade-player"

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw) as PlayerData
        if (data.name && data.age) {
          setPlayer(data)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const register = useCallback(
    async (
      name: string,
      age: number
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        // Check uniqueness
        const checkRes = await fetch(
          `/api/players?name=${encodeURIComponent(name)}`
        )
        const checkData = await checkRes.json()

        if (checkData.exists) {
          return { success: false, error: "Name is already taken. Choose another." }
        }

        // Register
        const registerRes = await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), age }),
        })

        if (!registerRes.ok) {
          const errData = await registerRes.json()
          return {
            success: false,
            error: errData.error || "Registration failed",
          }
        }

        const playerData: PlayerData = { name: name.trim(), age }
        setPlayer(playerData)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData))
        setShowRegistration(false)

        return { success: true }
      } catch {
        return { success: false, error: "Network error. Please try again." }
      }
    },
    []
  )

  const logout = useCallback(() => {
    setPlayer(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <PlayerContext.Provider
      value={{
        player,
        isRegistered: !!player,
        showRegistration,
        setShowRegistration,
        register,
        logout,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}
