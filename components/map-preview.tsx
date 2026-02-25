"use client"

import { memo, useEffect, useRef } from "react"
import type { MapId } from "@/lib/game-data"
import { getMazeObstacles, getGauntletObstacles } from "@/lib/map-obstacles"

const PREVIEW_SIZE = 120
const MINI_CELL = PREVIEW_SIZE / 20

export const MapPreview = memo(function MapPreview({ mapId, color }: { mapId: MapId; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Background
    ctx.fillStyle = "#0d0d24"
    ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE)

    // Grid
    ctx.strokeStyle = `${color}10`
    ctx.lineWidth = 0.3
    for (let i = 0; i <= 20; i++) {
      ctx.beginPath()
      ctx.moveTo(i * MINI_CELL, 0)
      ctx.lineTo(i * MINI_CELL, PREVIEW_SIZE)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * MINI_CELL)
      ctx.lineTo(PREVIEW_SIZE, i * MINI_CELL)
      ctx.stroke()
    }

    // Draw map-specific features
    if (mapId === "portal") {
      // Draw portal indicators on edges
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.setLineDash([3, 3])
      ctx.strokeRect(1, 1, PREVIEW_SIZE - 2, PREVIEW_SIZE - 2)
      ctx.setLineDash([])

      // Arrow indicators
      ctx.fillStyle = color
      ctx.globalAlpha = 0.4
      // left arrows
      for (let y = 4; y <= 16; y += 4) {
        const yp = y * MINI_CELL + MINI_CELL / 2
        ctx.beginPath()
        ctx.moveTo(2, yp)
        ctx.lineTo(8, yp - 3)
        ctx.lineTo(8, yp + 3)
        ctx.fill()
      }
      // right arrows
      for (let y = 4; y <= 16; y += 4) {
        const yp = y * MINI_CELL + MINI_CELL / 2
        ctx.beginPath()
        ctx.moveTo(PREVIEW_SIZE - 2, yp)
        ctx.lineTo(PREVIEW_SIZE - 8, yp - 3)
        ctx.lineTo(PREVIEW_SIZE - 8, yp + 3)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    } else if (mapId === "maze") {
      const obstacles = getMazeObstacles()
      ctx.fillStyle = color
      ctx.globalAlpha = 0.5
      obstacles.forEach((o) => {
        ctx.fillRect(o.x * MINI_CELL + 0.5, o.y * MINI_CELL + 0.5, MINI_CELL - 1, MINI_CELL - 1)
      })
      ctx.globalAlpha = 1
    } else if (mapId === "gauntlet") {
      const obstacles = getGauntletObstacles()
      ctx.fillStyle = color
      ctx.globalAlpha = 0.5
      obstacles.forEach((o) => {
        ctx.fillRect(o.x * MINI_CELL + 0.5, o.y * MINI_CELL + 0.5, MINI_CELL - 1, MINI_CELL - 1)
      })
      ctx.globalAlpha = 1
    } else if (mapId === "chaos") {
      // Scattered random-looking blocks
      ctx.fillStyle = color
      ctx.globalAlpha = 0.3
      const randomPositions = [
        { x: 3, y: 7 }, { x: 14, y: 3 }, { x: 8, y: 15 },
        { x: 17, y: 11 }, { x: 5, y: 12 }, { x: 11, y: 6 },
        { x: 16, y: 17 }, { x: 2, y: 18 },
      ]
      randomPositions.forEach((o) => {
        ctx.fillRect(o.x * MINI_CELL + 0.5, o.y * MINI_CELL + 0.5, MINI_CELL - 1, MINI_CELL - 1)
      })
      // Question marks to indicate randomness
      ctx.globalAlpha = 0.2
      ctx.font = "bold 16px monospace"
      ctx.fillStyle = color
      ctx.fillText("?", 45, 65)
      ctx.fillText("?", 75, 40)
      ctx.globalAlpha = 1
    }

    // Draw a sample snake in the middle
    ctx.fillStyle = color
    ctx.globalAlpha = 0.8
    const snakePositions = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
    ]
    snakePositions.forEach((s, i) => {
      ctx.globalAlpha = 0.8 - i * 0.15
      ctx.fillRect(s.x * MINI_CELL + 0.5, s.y * MINI_CELL + 0.5, MINI_CELL - 1, MINI_CELL - 1)
    })
    ctx.globalAlpha = 1

    // Draw food dot
    ctx.fillStyle = "#ff4757"
    ctx.beginPath()
    ctx.arc(13 * MINI_CELL + MINI_CELL / 2, 10 * MINI_CELL + MINI_CELL / 2, MINI_CELL / 2 - 0.5, 0, Math.PI * 2)
    ctx.fill()
  }, [mapId, color])

  return (
    <canvas
      ref={canvasRef}
      width={PREVIEW_SIZE}
      height={PREVIEW_SIZE}
      className="rounded-lg border border-border/20"
      aria-hidden="true"
    />
  )
})
