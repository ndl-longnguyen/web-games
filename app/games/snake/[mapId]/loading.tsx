export default function Loading() {
  return (
    <main className="min-h-dvh bg-background flex flex-col items-center justify-center px-4 gap-6">
      <div
        className="font-sans text-2xl md:text-4xl text-primary tracking-wider animate-pulse"
        style={{
          textShadow:
            "0 0 30px rgba(57, 255, 120, 0.4), 0 0 60px rgba(57, 255, 120, 0.15)",
        }}
      >
        LOADING...
      </div>
      <div
        className="w-full max-w-[400px] aspect-square rounded-lg border-2 border-primary/30 bg-card animate-pulse mx-4"
        style={{
          boxShadow:
            "0 0 30px rgba(57, 255, 120, 0.1), inset 0 0 30px rgba(57, 255, 120, 0.02)",
        }}
      />
    </main>
  )
}
