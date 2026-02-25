export default function Loading() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 gap-6">
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
        className="w-[400px] h-[400px] rounded-lg border-2 border-primary/30 bg-card animate-pulse"
        style={{
          boxShadow:
            "0 0 30px rgba(57, 255, 120, 0.1), inset 0 0 30px rgba(57, 255, 120, 0.02)",
        }}
      />
    </main>
  )
}
