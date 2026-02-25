"use client"

import { memo, useCallback, useRef } from "react"
import Link from "next/link"
import type { MapInfo } from "@/lib/game-data"
import { MapPreview } from "@/components/map-preview"

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "text-[#39ff78] border-[#39ff78]/30",
  Medium: "text-[#ffaa00] border-[#ffaa00]/30",
  Hard: "text-[#ff4757] border-[#ff4757]/30",
}

export const MapCard = memo(function MapCard({ map }: { map: MapInfo }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const onEnter = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.boxShadow = `0 0 25px ${map.color}20, inset 0 0 25px ${map.color}05`
      cardRef.current.style.borderColor = `${map.color}60`
    }
  }, [map.color])

  const onLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.boxShadow = "none"
      cardRef.current.style.borderColor = `${map.color}20`
    }
  }, [map.color])

  return (
    <Link href={`/games/snake/${map.id}`} aria-label={`Play ${map.name} map - ${map.difficulty} difficulty`}>
      <div
        ref={cardRef}
        className="group relative flex flex-col items-center gap-4 rounded-xl border-2 border-border/30 bg-card p-5 transition-all hover:bg-card/80 cursor-pointer"
        style={{
          borderColor: `${map.color}20`,
          transition: "box-shadow 0.3s, border-color 0.3s",
        }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <span
          className={`absolute top-3 right-3 font-mono text-[8px] px-2 py-0.5 rounded border ${DIFFICULTY_STYLES[map.difficulty]}`}
        >
          {map.difficulty.toUpperCase()}
        </span>

        <MapPreview mapId={map.id} color={map.color} />

        <div className="text-center">
          <h3 className="font-sans text-xs mb-2" style={{ color: map.color }}>
            {map.name}
          </h3>
          <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">
            {map.description}
          </p>
        </div>

        <span
          className="font-sans text-[10px] group-hover:tracking-widest transition-all"
          style={{ color: map.color }}
        >
          SELECT
        </span>
      </div>
    </Link>
  )
})
