import { useState } from 'react';
import TerminalPane from './components/TerminalPane.js';

const MAX_TERMINALS = 10;

function getGridStyle(count: number): React.CSSProperties {
  if (count === 1) {
    return { display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
  }
  const rows = Math.ceil(count / 2);
  return {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: `repeat(${rows}, 1fr)`,
  };
}

// SVG icons
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TerminalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export default function App() {
  const [terminalIds, setTerminalIds] = useState<number[]>([1]);

  const addTerminal = () => {
    setTerminalIds((ids) => {
      if (ids.length >= MAX_TERMINALS) return ids;
      const nextId = Math.max(...ids) + 1;
      return [...ids, nextId];
    });
  };

  const removeTerminal = (id: number) => {
    setTerminalIds((ids) => {
      if (ids.length <= 1) return ids;
      return ids.filter((i) => i !== id);
    });
  };

  const count = terminalIds.length;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0e1a' }}>
      {/* Topbar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: '40px',
        minHeight: '40px',
        background: '#0d1117',
        borderBottom: '1px solid #1e2d3d',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TerminalIcon />
          <span style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: '13px',
            fontWeight: 500,
            color: '#22c55e',
            letterSpacing: '0.02em',
          }}>
            AgentDeck
          </span>
          <span style={{
            fontSize: '11px',
            color: '#475569',
            fontFamily: "'Fira Code', monospace",
          }}>
            {count}/{MAX_TERMINALS}
          </span>
        </div>

        {/* Add terminal button */}
        {count < MAX_TERMINALS && (
          <button
            onClick={addTerminal}
            title="New terminal"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'transparent',
              border: '1px solid #1e2d3d',
              borderRadius: '5px',
              color: '#94a3b8',
              fontSize: '12px',
              fontFamily: "'Fira Sans', sans-serif",
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#22c55e';
              (e.currentTarget as HTMLButtonElement).style.color = '#22c55e';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e2d3d';
              (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
            }}
          >
            <PlusIcon />
            New terminal
          </button>
        )}
      </header>

      {/* Terminal grid */}
      <div style={{
        flex: 1,
        minHeight: 0,
        gap: '1px',
        background: '#1e2d3d',
        ...getGridStyle(count),
      }}>
        {terminalIds.map((id) => (
          <div key={id} style={{ overflow: 'hidden', minWidth: 0, minHeight: 0, background: '#0a0e1a' }}>
            <TerminalPane
              id={id}
              onClose={count > 1 ? () => removeTerminal(id) : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
