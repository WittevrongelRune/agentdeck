import { RefObject, useEffect } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

export function useTerminal(containerRef: RefObject<HTMLDivElement>) {
  useEffect(() => {
    if (!containerRef.current) return;

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
    term.open(containerRef.current);

    const rafId = requestAnimationFrame(() => fitAddon.fit());

    // F3: derive protocol from page scheme so wss:// works with HTTPS
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws`);

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
