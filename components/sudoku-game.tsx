"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// Level configurations - 10 difficulty levels
export const SUDOKU_LEVEL_CONFIGS = [
  { name: "Beginner", cellsToRemove: 30, description: "Perfect for learning" },
  { name: "Easy", cellsToRemove: 35, description: "Gentle challenge" },
  { name: "Simple", cellsToRemove: 40, description: "Getting warmer" },
  { name: "Medium", cellsToRemove: 43, description: "Balanced difficulty" },
  { name: "Moderate", cellsToRemove: 46, description: "Think carefully" },
  { name: "Tricky", cellsToRemove: 49, description: "Requires strategy" },
  { name: "Hard", cellsToRemove: 52, description: "For experienced players" },
  { name: "Expert", cellsToRemove: 55, description: "True challenge" },
  { name: "Master", cellsToRemove: 58, description: "Only for the best" },
  { name: "Impossible", cellsToRemove: 61, description: "Good luck!" },
]

type CellValue = number | null
type Board = CellValue[][]
type Notes = Set<number>[][]

interface SudokuGameProps {
  onScoreChange?: (score: number) => void
  onGameOver?: (score: number, time: number, won: boolean) => void
  onGameStart?: () => void
  canStart?: () => boolean
  isRunning: boolean
  setIsRunning: (running: boolean) => void
  startingLevel: number
  onTimeChange?: (time: number) => void
  onMistakesChange?: (mistakes: number) => void
}

// Generate a valid solved Sudoku board
function generateSolvedBoard(): Board {
  const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))
  
  // Fill diagonal 3x3 boxes first (they are independent)
  for (let box = 0; box < 9; box += 3) {
    fillBox(board, box, box)
  }
  
  // Solve the rest
  solveSudoku(board)
  
  return board
}

function fillBox(board: Board, row: number, col: number) {
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
  let idx = 0
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[row + i][col + j] = nums[idx++]
    }
  }
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function isValidPlacement(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false
  }
  
  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false
    }
  }
  
  return true
}

function solveSudoku(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
        for (const num of nums) {
          if (isValidPlacement(board, row, col, num)) {
            board[row][col] = num
            if (solveSudoku(board)) return true
            board[row][col] = null
          }
        }
        return false
      }
    }
  }
  return true
}

function createPuzzle(solvedBoard: Board, cellsToRemove: number): Board {
  const puzzle: Board = solvedBoard.map(row => [...row])
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
  )
  
  let removed = 0
  for (const [row, col] of positions) {
    if (removed >= cellsToRemove) break
    puzzle[row][col] = null
    removed++
  }
  
  return puzzle
}

function isBoardComplete(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) return false
    }
  }
  return true
}

function isBoardValid(board: Board): boolean {
  // Check all rows, columns, and boxes
  for (let i = 0; i < 9; i++) {
    const row = new Set<number>()
    const col = new Set<number>()
    const box = new Set<number>()
    
    for (let j = 0; j < 9; j++) {
      // Check row
      if (board[i][j] !== null) {
        if (row.has(board[i][j]!)) return false
        row.add(board[i][j]!)
      }
      
      // Check column
      if (board[j][i] !== null) {
        if (col.has(board[j][i]!)) return false
        col.add(board[j][i]!)
      }
      
      // Check box
      const boxRow = Math.floor(i / 3) * 3 + Math.floor(j / 3)
      const boxCol = (i % 3) * 3 + (j % 3)
      if (board[boxRow][boxCol] !== null) {
        if (box.has(board[boxRow][boxCol]!)) return false
        box.add(board[boxRow][boxCol]!)
      }
    }
  }
  return true
}

export function SudokuGame({
  onScoreChange,
  onGameOver,
  onGameStart,
  canStart,
  isRunning,
  setIsRunning,
  startingLevel,
  onTimeChange,
  onMistakesChange,
}: SudokuGameProps) {
  const [puzzle, setPuzzle] = useState<Board | null>(null)
  const [solution, setSolution] = useState<Board | null>(null)
  const [board, setBoard] = useState<Board | null>(null)
  const [initialBoard, setInitialBoard] = useState<Board | null>(null)
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [notes, setNotes] = useState<Notes>([])
  const [notesMode, setNotesMode] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [time, setTime] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [highlightedNum, setHighlightedNum] = useState<number | null>(null)
  
  const maxMistakes = 15
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize new game
  const initGame = useCallback(() => {
    const solved = generateSolvedBoard()
    const cellsToRemove = SUDOKU_LEVEL_CONFIGS[startingLevel - 1].cellsToRemove
    const newPuzzle = createPuzzle(solved, cellsToRemove)
    
    setSolution(solved)
    setPuzzle(newPuzzle)
    setBoard(newPuzzle.map(row => [...row]))
    setInitialBoard(newPuzzle.map(row => [...row]))
    setNotes(Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => new Set<number>())
    ))
    setSelectedCell(null)
    setMistakes(0)
    setTime(0)
    setGameWon(false)
    setNotesMode(false)
    setHighlightedNum(null)
    onMistakesChange?.(0)
    onTimeChange?.(0)
  }, [startingLevel, onMistakesChange, onTimeChange])

  // Timer
  useEffect(() => {
    if (isRunning && !gameWon) {
      timerRef.current = setInterval(() => {
        setTime(t => {
          const newTime = t + 1
          onTimeChange?.(newTime)
          return newTime
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, gameWon, onTimeChange])

  // Handle number input
  const handleNumberInput = useCallback((num: number) => {
    if (!selectedCell || !board || !solution || !initialBoard || gameWon || !isRunning) return
    
    const [row, col] = selectedCell
    
    // Can't modify initial cells
    if (initialBoard[row][col] !== null) return
    
    if (notesMode) {
      // Toggle note
      setNotes(prevNotes => {
        const newNotes = prevNotes.map(r => r.map(c => new Set(c)))
        if (newNotes[row][col].has(num)) {
          newNotes[row][col].delete(num)
        } else {
          newNotes[row][col].add(num)
        }
        return newNotes
      })
    } else {
      // Place number
      const newBoard = board.map(r => [...r])
      newBoard[row][col] = num
      
      // Check if correct
      if (num !== solution[row][col]) {
        const newMistakes = mistakes + 1
        setMistakes(newMistakes)
        onMistakesChange?.(newMistakes)
        
        if (newMistakes >= maxMistakes) {
          // Game over
          setIsRunning(false)
          const score = calculateScore(time, mistakes + 1, startingLevel, false)
          onScoreChange?.(score)
          onGameOver?.(score, time, false)
          return
        }
      } else {
        // Clear notes for this cell
        setNotes(prevNotes => {
          const newNotes = prevNotes.map(r => r.map(c => new Set(c)))
          newNotes[row][col].clear()
          return newNotes
        })
      }
      
      setBoard(newBoard)
      
      // Check win
      if (isBoardComplete(newBoard) && isBoardValid(newBoard)) {
        setGameWon(true)
        setIsRunning(false)
        const score = calculateScore(time, mistakes, startingLevel, true)
        onScoreChange?.(score)
        onGameOver?.(score, time, true)
      }
    }
  }, [selectedCell, board, solution, initialBoard, gameWon, isRunning, notesMode, mistakes, time, startingLevel, setIsRunning, onScoreChange, onGameOver, onMistakesChange])

  // Clear cell
  const handleClear = useCallback(() => {
    if (!selectedCell || !board || !initialBoard || gameWon || !isRunning) return
    
    const [row, col] = selectedCell
    if (initialBoard[row][col] !== null) return
    
    const newBoard = board.map(r => [...r])
    newBoard[row][col] = null
    setBoard(newBoard)
    
    // Also clear notes
    setNotes(prevNotes => {
      const newNotes = prevNotes.map(r => r.map(c => new Set(c)))
      newNotes[row][col].clear()
      return newNotes
    })
  }, [selectedCell, board, initialBoard, gameWon, isRunning])

  // Hint
  const handleHint = useCallback(() => {
    if (!board || !solution || !initialBoard || gameWon || !isRunning) return
    
    // Find empty cell
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null) {
          const newBoard = board.map(r => [...r])
          newBoard[row][col] = solution[row][col]
          setBoard(newBoard)
          setSelectedCell([row, col])
          
          // Check win
          if (isBoardComplete(newBoard) && isBoardValid(newBoard)) {
            setGameWon(true)
            setIsRunning(false)
            const score = calculateScore(time, mistakes, startingLevel, true)
            onScoreChange?.(score)
            onGameOver?.(score, time, true)
          }
          return
        }
      }
    }
  }, [board, solution, initialBoard, gameWon, isRunning, time, mistakes, startingLevel, setIsRunning, onScoreChange, onGameOver])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRunning || gameWon) return
      
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key))
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleClear()
      } else if (e.key === 'n' || e.key === 'N') {
        setNotesMode(m => !m)
      } else if (e.key === 'h' || e.key === 'H') {
        handleHint()
      } else if (selectedCell) {
        const [row, col] = selectedCell
        if (e.key === 'ArrowUp' && row > 0) {
          setSelectedCell([row - 1, col])
        } else if (e.key === 'ArrowDown' && row < 8) {
          setSelectedCell([row + 1, col])
        } else if (e.key === 'ArrowLeft' && col > 0) {
          setSelectedCell([row, col - 1])
        } else if (e.key === 'ArrowRight' && col < 8) {
          setSelectedCell([row, col + 1])
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, gameWon, selectedCell, handleNumberInput, handleClear, handleHint])

  // Calculate score
  function calculateScore(time: number, mistakes: number, level: number, won: boolean): number {
    if (!won) return 0
    const baseScore = 10000
    const levelBonus = level * 1000
    const timePenalty = Math.min(time * 5, 5000)
    const mistakePenalty = mistakes * 500
    return Math.max(0, baseScore + levelBonus - timePenalty - mistakePenalty)
  }

  // Format time
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start game
  const handleStart = () => {
    // Call onGameStart first - it will handle registration prompt if needed
    onGameStart?.()
    // If canStart returns false after onGameStart, still allow playing
    initGame()
    setIsRunning(true)
  }

  // Get cell style
  const getCellStyle = (row: number, col: number) => {
    if (!board || !initialBoard || !solution) return ""
    
    let classes = "w-full h-full flex items-center justify-center text-lg sm:text-xl font-sans font-bold transition-all cursor-pointer select-none "
    
    // Border for 3x3 boxes
    if (col % 3 === 0) classes += "border-l-2 border-l-primary/50 "
    if (row % 3 === 0) classes += "border-t-2 border-t-primary/50 "
    if (col === 8) classes += "border-r-2 border-r-primary/50 "
    if (row === 8) classes += "border-b-2 border-b-primary/50 "
    
    // Regular borders
    classes += "border border-border/50 "
    
    // Selected cell
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      classes += "bg-primary/30 "
    } else if (selectedCell) {
      // Highlight same row, column, or box
      const [selRow, selCol] = selectedCell
      const sameRow = row === selRow
      const sameCol = col === selCol
      const sameBox = Math.floor(row / 3) === Math.floor(selRow / 3) && 
                      Math.floor(col / 3) === Math.floor(selCol / 3)
      if (sameRow || sameCol || sameBox) {
        classes += "bg-primary/10 "
      }
    }
    
    // Highlight same number
    if (highlightedNum && board[row][col] === highlightedNum) {
      classes += "bg-primary/20 "
    }
    
    // Initial cell (given)
    if (initialBoard[row][col] !== null) {
      classes += "text-foreground "
    } else if (board[row][col] !== null) {
      // User input - check if correct
      if (board[row][col] === solution[row][col]) {
        classes += "text-primary "
      } else {
        classes += "text-destructive "
      }
    }
    
    return classes
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      {/* Game board */}
      <div className="relative">
        {!isRunning && !gameWon && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-primary text-primary-foreground font-mono text-sm rounded-lg hover:bg-primary/90 transition-colors"
            >
              {board ? "RESTART" : "START GAME"}
            </button>
          </div>
        )}
        
        {gameWon && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <p className="font-sans text-2xl text-primary mb-2">COMPLETED!</p>
            <p className="font-mono text-sm text-muted-foreground mb-4">
              Time: {formatTime(time)} | Mistakes: {mistakes}
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-primary text-primary-foreground font-mono text-sm rounded-lg hover:bg-primary/90 transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
        
        {mistakes >= maxMistakes && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <p className="font-sans text-2xl text-destructive mb-2">GAME OVER</p>
            <p className="font-mono text-sm text-muted-foreground mb-4">
              Too many mistakes!
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-primary text-primary-foreground font-mono text-sm rounded-lg hover:bg-primary/90 transition-colors"
            >
              TRY AGAIN
            </button>
          </div>
        )}
        
        <div 
          className="grid grid-cols-9 bg-card rounded-lg overflow-hidden border-2 border-primary/50"
          style={{ width: 'min(360px, 90vw)', height: 'min(360px, 90vw)' }}
        >
          {board && Array(9).fill(null).map((_, row) =>
            Array(9).fill(null).map((_, col) => (
              <div
                key={`${row}-${col}`}
                className={getCellStyle(row, col)}
                onClick={() => {
                  setSelectedCell([row, col])
                  if (board[row][col]) {
                    setHighlightedNum(board[row][col])
                  } else {
                    setHighlightedNum(null)
                  }
                }}
              >
                {board[row][col] !== null ? (
                  board[row][col]
                ) : notes[row]?.[col]?.size > 0 ? (
                  <div className="grid grid-cols-3 gap-0 text-[8px] sm:text-[10px] text-muted-foreground w-full h-full p-0.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <span key={n} className="flex items-center justify-center">
                        {notes[row][col].has(n) ? n : ''}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Number pad */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotesMode(!notesMode)}
            className={`px-3 py-2 rounded-lg font-mono text-xs transition-colors ${
              notesMode 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            Notes {notesMode ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-2 rounded-lg bg-secondary text-foreground font-mono text-xs hover:bg-secondary/80 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleHint}
            className="px-3 py-2 rounded-lg bg-secondary text-foreground font-mono text-xs hover:bg-secondary/80 transition-colors"
          >
            Hint
          </button>
        </div>
        
        <div className="grid grid-cols-9 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-secondary text-foreground font-sans text-lg font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
      
      {/* Mistakes indicator */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">Mistakes:</span>
        <span className={`font-mono text-sm font-bold ${mistakes >= maxMistakes ? 'text-destructive' : mistakes > maxMistakes / 2 ? 'text-yellow-500' : 'text-foreground'}`}>
          {mistakes} / {maxMistakes}
        </span>
      </div>
    </div>
  )
}
