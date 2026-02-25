# Web Games

A modern web-based gaming platform built with Next.js and TypeScript. Features interactive games with customizable maps and real-time scoring.

## Features

- 🎮 **Snake Game** - Classic snake gameplay with custom map support
- 🎯 **Multiple Maps** - Play on different maps with various obstacles
- 📊 **Scoreboard** - Track your high scores
- 🌓 **Dark/Light Mode** - Theme switcher included
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Fast Performance** - Built with Next.js for optimal performance

## Tech Stack

- **Frontend Framework**: Next.js 16
- **Language**: TypeScript
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS + PostCSS
- **Theme**: next-themes for dark mode support
- **Forms**: React Hook Form
- **Animations**: Embla Carousel
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

The app will be available at `http://localhost:3000`

## Project Structure

```
web-games/
├── app/                    # Next.js app directory
│   ├── games/             # Game pages
│   │   └── snake/         # Snake game
│   │       └── [mapId]/   # Dynamic map routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components (Radix UI based)
│   ├── snake-game.tsx    # Main snake game component
│   └── ...               # Other components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   ├── game-data.ts      # Game data and maps
│   ├── map-obstacles.ts  # Obstacle definitions
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── styles/               # Global styles
└── package.json          # Dependencies and scripts
```

## Available Games

### Snake
- Classic snake game mechanics
- Customizable maps with obstacles
- Score tracking
- Multiple difficulty levels

## Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## License

MIT
