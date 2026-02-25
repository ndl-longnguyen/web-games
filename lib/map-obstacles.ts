type Position = { x: number; y: number }

const GRID_WIDTH = 20
const GRID_HEIGHT = 20

export function getMazeObstacles(): Position[] {
  const obstacles: Position[] = []

  // Outer inner frame (leave corners open for movement)
  for (let i = 4; i <= 15; i++) {
    obstacles.push({ x: i, y: 4 }) // top bar
    obstacles.push({ x: i, y: 15 }) // bottom bar
  }
  for (let i = 5; i <= 14; i++) {
    obstacles.push({ x: 4, y: i }) // left bar
    obstacles.push({ x: 15, y: i }) // right bar
  }

  // Remove gaps for passage
  const gapPositions = [
    { x: 9, y: 4 }, { x: 10, y: 4 },   // top gap
    { x: 9, y: 15 }, { x: 10, y: 15 },  // bottom gap
    { x: 4, y: 9 }, { x: 4, y: 10 },    // left gap
    { x: 15, y: 9 }, { x: 15, y: 10 },  // right gap
  ]

  // Center cross
  for (let i = 8; i <= 11; i++) {
    obstacles.push({ x: i, y: 9 })
    obstacles.push({ x: i, y: 10 })
    obstacles.push({ x: 9, y: i })
    obstacles.push({ x: 10, y: i })
  }

  // Remove center duplicates and gap positions
  const gapSet = new Set(gapPositions.map((p) => `${p.x},${p.y}`))
  const seen = new Set<string>()
  return obstacles.filter((p) => {
    const key = `${p.x},${p.y}`
    if (gapSet.has(key) || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function getGauntletObstacles(): Position[] {
  const obstacles: Position[] = []

  // Horizontal barriers with small gaps
  // Row 4 - gap on right
  for (let x = 0; x < GRID_WIDTH - 3; x++) {
    obstacles.push({ x, y: 4 })
  }

  // Row 8 - gap on left
  for (let x = 3; x < GRID_WIDTH; x++) {
    obstacles.push({ x, y: 8 })
  }

  // Row 12 - gap on right
  for (let x = 0; x < GRID_WIDTH - 3; x++) {
    obstacles.push({ x, y: 12 })
  }

  // Row 16 - gap on left
  for (let x = 3; x < GRID_WIDTH; x++) {
    obstacles.push({ x, y: 16 })
  }

  return obstacles
}

export function generateChaosObstacle(
  snake: Position[],
  food: Position,
  existingObstacles: Position[]
): Position[] {
  const occupied = new Set<string>()
  snake.forEach((s) => occupied.add(`${s.x},${s.y}`))
  occupied.add(`${food.x},${food.y}`)
  existingObstacles.forEach((o) => occupied.add(`${o.x},${o.y}`))

  // Add 1-2 random obstacle blocks around the grid (avoid edges where snake spawns)
  const count = Math.random() > 0.5 ? 2 : 1
  const newObs: Position[] = []

  for (let i = 0; i < count; i++) {
    let attempts = 0
    while (attempts < 50) {
      const pos = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT),
      }
      const key = `${pos.x},${pos.y}`
      if (!occupied.has(key)) {
        newObs.push(pos)
        occupied.add(key)
        break
      }
      attempts++
    }
  }

  return newObs
}
