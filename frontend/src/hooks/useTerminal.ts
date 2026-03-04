import { RefObject, useEffect } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

export function useTerminal(containerRef: RefObject<HTMLDivElement>) {
  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 13,
      fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", Menlo, monospace',
      fontWeight: '400',
      lineHeight: 1.2,
      theme: {
        background: '#0a0e1a',
        foreground: '#e2e8f0',
        cursor: '#22c55e',
        cursorAccent: '#0a0e1a',
        selectionBackground: '#22c55e33',
        black: '#1e293b',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#fbbf24',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#e2e8f0',
        brightBlack: '#475569',
        brightRed: '#fca5a5',
        brightGreen: '#86efac',
        brightYellow: '#fde68a',
        brightBlue: '#93c5fd',
        brightMagenta: '#d8b4fe',
        brightCyan: '#67e8f9',
        brightWhite: '#f8fafc',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);

    const rafId = requestAnimationFrame(() => fitAddon.fit());

    // Connect directly to backend — Vite proxy for WebSockets is unreliable
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//localhost:3001`);

    ws.onopen = () => {
      // Send initial size once connected
      const dims = fitAddon.proposeDimensions();
      if (dims) {
        ws.send(JSON.stringify({ type: 'resize', cols: dims.cols, rows: dims.rows }));
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as { type: string; data: string };
        if (msg.type === 'output') {
          term.write(msg.data);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => {
      term.writeln('\r\nWebSocket error. Is the backend running?');
    };

    ws.onclose = () => {
      term.writeln('\r\nSession ended.');
    };

    // Terminal input → WebSocket
    term.onData((data: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data }));
      }
    });

    // Resize terminal when container size changes
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      const dims = fitAddon.proposeDimensions();
      if (dims && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'resize', cols: dims.cols, rows: dims.rows }));
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      // F4: null both onclose and onerror to prevent writes to disposed terminal
      ws.onclose = null;
      ws.onerror = null;
      ws.close();
      term.dispose();
      // Note: in React StrictMode (development), this cleanup runs after the first
      // mount, causing a transient PTY process to be created and killed. This is
      // expected behaviour — StrictMode verifies cleanup logic works correctly.
    };
  }, []);
}
