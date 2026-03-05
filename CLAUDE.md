# AgentDeck — AI Agent Dashboard

> "All your agents, one screen."

## Wat is dit project?

AgentDeck is een lokale web app die fungeert als centrale command center voor developers die meerdere Claude Code agents tegelijk draaien. In plaats van constant te switchen tussen terminal-tabs en toestemmingsverzoeken te missen, zie je alle agents in één browservenster.

## Planning Artifacts

- **Product Brief:** `../_bmad-output/planning-artifacts/product-brief-programmeren-2026-03-02.md`
- **Brainstorm Sessie:** `../_bmad-output/brainstorming/brainstorming-session-2026-03-02.md`

## Tech Stack

- **Frontend:** React + xterm.js
- **Backend:** Node.js + node-pty + WebSockets (ws of socket.io)
- **Platform:** Mac (native PTY) + Windows WSL (via WSL2)
- **Entry point:** `npm start` → opent op `localhost:3000`

## MVP Scope (v1 — bouwen nu)

### In scope
1. **Terminal Multiplexer Kern**
   - Embedded xterm.js terminals per agent in de browser
   - Echte PTY processen via node-pty + WebSockets
   - Interactief typen in elke terminal (identiek aan gewone terminal)
   - Cross-platform: Mac + Windows/WSL

2. **Auto-layout**
   - 1 agent = fullscreen, 2 = naast elkaar, 3 = 2+1, 4 = 2x2
   - Handmatig resizen door randen te slepen

3. **Agent Titels & Status**
   - Auto-titel op basis van werkmap
   - Dubbelklik om te hernoemen
   - Kleurgecodeerde statusbadge (groen = actief, oranje = wacht op input, rood = wacht op toestemming)

4. **Toestemmingssysteem**
   - Detecteer Claude Code toestemmingsverzoeken in terminal output
   - Popup-notificatie met Toestaan / Weigeren knoppen
   - Permission inbox/queue voor openstaande verzoeken
   - Agent staat stil tijdens wachten (zoals native Claude Code)

5. **Status Overview Bar**
   - Vaste balk met alle agents: naam + statusbadge
   - Klik om die agent-pane te focussen

### Buiten scope voor v1
- Agent launcher/stopper vanuit de app (v2)
- Templates library (v2)
- Agent orchestratie / pipelines (v2)
- Agent-to-agent communicatie (v2)
- Per-agent toestemmingsregels (v2)
- Log zoekbalk (v2)
- Remote agents (v2)

## Architectuur Principes

- **Stateless** — geen database, geen cloud, geen persistentie
- **Lokaal** — draait alleen op localhost, nooit extern bereikbaar
- **Minimale setup** — clone → npm install → npm start
- **Agent-aware** — begrijpt Claude Code output patronen, niet alleen een terminal viewer

## Succes Criteria

AgentDeck v1 is klaar als:
- [ ] `claude` kan gestart worden in een werkmap vanuit de app
- [ ] 2-3 terminals naast elkaar zichtbaar zijn en interactief werken
- [ ] Toestemmingsverzoek verschijnt als popup zonder naar terminal te kijken
- [ ] Statusbalk toont in één oogopslag alle agent-statussen
- [ ] Setup duurt minder dan 5 minuten (clone → werkende app)
