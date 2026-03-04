import { WebSocketServer, WebSocket } from 'ws';
import * as pty from 'node-pty';
import os from 'os';

const PORT = 3001;
const shell = process.platform === 'win32' ? 'bash.exe' : '/bin/bash';

const wss = new WebSocketServer({ port: PORT });

wss.on('error', (err: Error) => {
  console.error('Server error:', err);
  process.exit(1);
});

wss.on('listening', () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

let terminalCounter = 0;

wss.on('connection', (ws: WebSocket) => {
  const id = ++terminalCounter;
  console.log(`terminal-${id} connected`);

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: os.homedir(),
    env: Object.fromEntries(
      Object.entries(process.env).filter(([, v]) => v !== undefined)
    ) as { [key: string]: string },
  });

  // PTY output → WebSocket
  // F5: also send while CLOSING so final output (e.g. on `exit`) is not dropped
  ptyProcess.onData((data: string) => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CLOSING) {
      try {
        ws.send(JSON.stringify({ type: 'output', data }));
      } catch {
        // ignore send errors during close
      }
    }
  });

  ptyProcess.onExit(() => {
    console.log(`terminal-${id} process exited`);
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  // WebSocket input → PTY
  ws.on('message', (raw: Buffer) => {
    try {
      const msg = JSON.parse(raw.toString()) as
        | { type: 'input'; data: string }
        | { type: 'resize'; cols: number; rows: number };

      if (msg.type === 'input') {
        ptyProcess.write(msg.data);
      } else if (msg.type === 'resize') {
        ptyProcess.resize(msg.cols, msg.rows);
      }
    } catch {
      // ignore malformed messages
    }
  });

  ws.on('close', () => {
    console.log(`terminal-${id} disconnected`);
    try {
      ptyProcess.kill();
    } catch {
      // process may already be dead
    }
  });

  ws.on('error', (err: Error) => {
    console.error(`terminal-${id} WebSocket error:`, err);
  });
});
