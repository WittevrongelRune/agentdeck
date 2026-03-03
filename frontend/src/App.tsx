import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export default function App() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // F6 fix: guard against null ref
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1a1a1a',
        foreground: '#d4d4d4',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);

    // F7 fix: defer fit() until after browser has painted real dimensions
    const rafId = requestAnimationFrame(() => fitAddon.fit());

    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onopen = () => {
      term.writeln('Connected to AgentDeck backend.');
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as { type: string; message: string };
        if (msg.type === 'server_ready') {
          term.writeln(msg.message);
        } else {
          term.write(event.data as string);
        }
      } catch {
        term.write(event.data as string);
      }
    };

    ws.onerror = () => {
      term.writeln('\r\nWebSocket error. Is the backend running?');
    };

    ws.onclose = () => {
      term.writeln('\r\nDisconnected from backend.');
    };

    term.onData((data: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      // F15 fix: null out onclose before closing to avoid write-after-dispose
      ws.onclose = null;
      ws.close();
      term.dispose();
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      style={{ width: '100%', height: '100%', padding: '8px' }}
    />
  );
}
