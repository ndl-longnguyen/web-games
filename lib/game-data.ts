export type MapId = "classic" | "portal" | "maze" | "gauntlet" | "chaos"

export interface MapInfo {
  id: MapId
  name: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  color: string
}

export const SNAKE_MAPS: MapInfo[] = [
  {
    id: "classic",
    name: "Classic",
    description: "The original experience. Walls are deadly, no obstacles. Pure skill.",
    difficulty: "Easy",
    color: "#39ff78",
  },
  {
    id: "portal",
    name: "Portal Walls",
    description: "Walls are portals! Pass through one side and appear on the other.",
    difficulty: "Easy",
    color: "#00d4ff",
  },
  {
    id: "maze",
    name: "Maze Runner",
    description: "Navigate through a symmetric maze of obstacles. Watch your path!",
    difficulty: "Medium",
    color: "#ffaa00",
  },
  {
    id: "gauntlet",
    name: "The Gauntlet",
    description: "Tight corridors with narrow gaps. One wrong turn and it's over.",
    difficulty: "Hard",
    color: "#ff4757",
  },
  {
    id: "chaos",
    name: "Random Chaos",
    description: "New obstacles spawn every time you eat. The arena shrinks around you!",
    difficulty: "Hard",
    color: "#c850c0",
  },
]

export interface GameInfo {
  id: string
  name: string
  description: string
  href: string
  available: boolean
}

export const GAMES: GameInfo[] = [
  {
    id: "snake",
    name: "Snake",
    description: "Eat, grow, survive. The classic arcade experience.",
    href: "/games/snake",
    available: true,
  },
  {
    id: "tetris",
    name: "Tetris",
    description: "Stack blocks. Clear lines. Chase the high score.",
    href: "/games/tetris",
    available: true,
  },
  {
    id: "pong",
    name: "Breakout",
    description: "Break the bricks! 10 unique levels with pipes and tubes.",
    href: "/games/pong",
    available: true,
  },
  {
    id: "space-invaders",
    name: "Space Invaders",
    description: "Defend Earth from waves of descending alien invaders.",
    href: "/games/space-invaders",
    available: true,
  },
  {
    id: "sudoku",
    name: "Sudoku",
    description: "Classic number puzzle. 10 difficulty levels to master.",
    href: "/games/sudoku",
    available: true,
  },
]
