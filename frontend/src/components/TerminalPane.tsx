import { useRef, useState } from 'react';
import { useTerminal } from '../hooks/useTerminal.js';
import '@xterm/xterm/css/xterm.css';

interface TerminalPaneProps {
  onClose: () => void;
}

export default function TerminalPane({ onClose }: TerminalPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  useTerminal(containerRef);

  return (
    <div
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#1a1a1a' }}
      />
      {hovered && (
        <button
          onClick={onClose}
          title="Close terminal"
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#666',
            color: '#d4d4d4',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            opacity: 0.85,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
