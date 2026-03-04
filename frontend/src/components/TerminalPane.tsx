import { useRef, useState } from 'react';
import { useTerminal } from '../hooks/useTerminal.js';
import '@xterm/xterm/css/xterm.css';

interface TerminalPaneProps {
  id: number;
  onClose?: () => void;
}

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function TerminalPane({ id, onClose }: TerminalPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  useTerminal(containerRef);

  return (
    <div
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pane header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        height: '28px',
        minHeight: '28px',
        background: '#0d1117',
        borderBottom: '1px solid #1e2d3d',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: '11px',
          color: '#475569',
        }}>
          terminal <span style={{ color: '#64748b' }}>{id}</span>
        </span>

        {onClose && (
          <button
            onClick={onClose}
            title="Close terminal"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '18px',
              height: '18px',
              borderRadius: '3px',
              border: 'none',
              background: hovered ? '#1e2d3d' : 'transparent',
              color: hovered ? '#94a3b8' : 'transparent',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              flexShrink: 0,
            }}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Terminal */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          background: '#0a0e1a',
          padding: '4px',
        }}
      />
    </div>
  );
}
