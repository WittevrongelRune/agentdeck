import { useState } from 'react';
import TerminalPane from './components/TerminalPane.js';

const MAX_TERMINALS = 4;

// CSS Grid templates per aantal terminals
const gridTemplates: Record<number, { areas: string; columns: string; rows: string }> = {
  1: { areas: '"a"',           columns: '1fr',      rows: '1fr' },
  2: { areas: '"a b"',         columns: '1fr 1fr',  rows: '1fr' },
  3: { areas: '"a b" "c c"',   columns: '1fr 1fr',  rows: '1fr 1fr' },
  4: { areas: '"a b" "c d"',   columns: '1fr 1fr',  rows: '1fr 1fr' },
};

const gridAreas = ['a', 'b', 'c', 'd'];

export default function App() {
  const [terminalIds, setTerminalIds] = useState<number[]>([1]);

  const addTerminal = () => {
    setTerminalIds((ids) => {
      if (ids.length >= MAX_TERMINALS) return ids;
      const nextId = Math.max(...ids) + 1;
      return [...ids, nextId];
    });
  };

  const count = terminalIds.length;
  const template = gridTemplates[count] ?? gridTemplates[4];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#1a1a1a' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateAreas: template.areas,
          gridTemplateColumns: template.columns,
          gridTemplateRows: template.rows,
          gap: '2px',
          backgroundColor: '#333',
        }}
      >
        {terminalIds.map((id, index) => (
          <div
            key={id}
            style={{ gridArea: gridAreas[index], overflow: 'hidden', minWidth: 0, minHeight: 0 }}
          >
            <TerminalPane />
          </div>
        ))}
      </div>

      {count < MAX_TERMINALS && (
        <button
          onClick={addTerminal}
          title="New terminal"
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#444',
            color: '#d4d4d4',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          +
        </button>
      )}
    </div>
  );
}
