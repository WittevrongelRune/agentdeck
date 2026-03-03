import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3001;

const wss = new WebSocketServer({ port: PORT });

// F2 fix: handle server-level errors (e.g. EADDRINUSE)
wss.on('error', (err: Error) => {
  console.error('Server error:', err);
  process.exit(1);
});

wss.on('listening', () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  ws.send(JSON.stringify({ type: 'server_ready', message: 'AgentDeck backend connected' }));

  ws.on('message', (_data: Buffer) => {
    // F9 fix: do not log raw input (contains keystrokes/passwords when PTY is wired)
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (err: Error) => {
    console.error('WebSocket error:', err);
  });
});
