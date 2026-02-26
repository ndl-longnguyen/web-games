"use client"

import { useState, useCallback, type FormEvent } from "react"
import { usePlayer } from "./player-provider"

export function PlayerRegistration() {
  const { showRegistration, setShowRegistration, register } = usePlayer()
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setError("")

      const trimmedName = name.trim()
      if (trimmedName.length < 2 || trimmedName.length > 20) {
        setError("Name must be 2-20 characters.")
        return
      }

      const ageNum = parseInt(age, 10)
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        setError("Please enter a valid age (1-120).")
        return
      }

      setLoading(true)
      const result = await register(trimmedName, ageNum)
      setLoading(false)

      if (!result.success) {
        setError(result.error || "Something went wrong.")
      }
    },
    [name, age, register]
  )

  if (!showRegistration) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-sm rounded-xl border border-primary/30 bg-card p-6 flex flex-col gap-5"
        style={{
          boxShadow:
            "0 0 40px rgba(57, 255, 120, 0.12), inset 0 0 20px rgba(57, 255, 120, 0.02)",
        }}
      >
        {/* Header */}
        <div className="text-center">
          <h2
            className="font-sans text-sm sm:text-base text-primary tracking-wider"
            style={{
              textShadow: "0 0 20px rgba(57, 255, 120, 0.4)",
            }}
          >
            PLAYER REGISTRATION
          </h2>
          <p className="font-mono text-[10px] text-muted-foreground mt-2">
            Enter your name and age to play
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="player-name"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider"
            >
              Player Name
            </label>
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter unique name..."
              maxLength={20}
              autoFocus
              autoComplete="off"
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>

          {/* Age */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="player-age"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider"
            >
              Age
            </label>
            <input
              id="player-age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age..."
              min={1}
              max={120}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="font-mono text-[10px] text-destructive text-center">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowRegistration(false)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-secondary font-mono text-[10px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-[10px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: "0 0 15px rgba(57, 255, 120, 0.25)",
              }}
            >
              {loading ? "CHECKING..." : "REGISTER"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
