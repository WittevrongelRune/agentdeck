# AgentDeck

> All your agents, one screen.

A local web app that acts as a central command center for developers running multiple Claude Code agents simultaneously.

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **node-gyp build tools** (required for `node-pty`):
  - **Mac:** `xcode-select --install`
  - **Windows/WSL:** `npm install --global windows-build-tools`

## Quick Start

```bash
# 1. Install root dependencies
npm install

# 2. Install backend dependencies
npm install --prefix backend

# 3. Install frontend dependencies
npm install --prefix frontend

# 4. Start both servers
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** Use npm (not yarn or pnpm) — the start script uses npm-specific `--prefix` syntax.

## Architecture

```
agentdeck/
├── backend/              # Node.js WebSocket + PTY server (port 3001)
│   ├── server.ts         # TypeScript entry point (run via tsx)
│   ├── tsconfig.json
│   └── package.json
├── frontend/             # React + xterm.js (port 3000)
│   ├── index.html
│   ├── vite.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       └── App.tsx
└── package.json          # Root — runs both with concurrently
```

## Ports

| Service | Port |
|---------|------|
| Frontend (React/Vite) | 3000 |
| Backend (WebSocket) | 3001 |
