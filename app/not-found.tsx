import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist. Return to NDL Arcade.",
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 gap-6">
      <h1
        className="font-sans text-4xl md:text-6xl text-primary"
        style={{
          textShadow:
            "0 0 30px rgba(57, 255, 120, 0.4), 0 0 60px rgba(57, 255, 120, 0.15)",
        }}
      >
        404
      </h1>
      <p className="font-mono text-xs text-muted-foreground text-center">
        {"// page not found"}
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary text-primary-foreground font-sans text-xs rounded-lg transition-all hover:scale-105"
        style={{ boxShadow: "0 0 20px rgba(57, 255, 120, 0.3)" }}
      >
        BACK TO ARCADE
      </Link>
    </main>
  )
}
