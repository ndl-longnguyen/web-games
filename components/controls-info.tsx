"use client"

export function ControlsInfo() {
  return (
    <div className="hidden md:flex items-center gap-6 text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <Kbd>W</Kbd>
          <Kbd>A</Kbd>
          <Kbd>S</Kbd>
          <Kbd>D</Kbd>
        </div>
        <span className="font-mono text-xs">or</span>
        <div className="flex gap-1">
          <Kbd>{"^"}</Kbd>
          <Kbd>{"<"}</Kbd>
          <Kbd>v</Kbd>
          <Kbd>{">"}</Kbd>
        </div>
        <span className="font-mono text-xs ml-1">Move</span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-2">
        <Kbd className="px-3">Space</Kbd>
        <span className="font-mono text-xs">Start</span>
      </div>
    </div>
  )
}

function Kbd({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded border border-border bg-secondary text-foreground font-mono text-[10px] ${className}`}
    >
      {children}
    </kbd>
  )
}
