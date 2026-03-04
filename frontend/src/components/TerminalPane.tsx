import { useRef } from 'react';
import { useTerminal } from '../hooks/useTerminal.js';
import '@xterm/xterm/css/xterm.css';

export default function TerminalPane() {
  const containerRef = useRef<HTMLDivElement>(null);
  useTerminal(containerRef);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
      }}
    />
  );
}
