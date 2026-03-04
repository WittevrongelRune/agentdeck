import { useState } from 'react';
import TerminalPane from './components/TerminalPane.js';

const MAX_TERMINALS = 10;

// Compute a 2-column CSS grid layout for N terminals.
// 1 terminal = single column, 2+ = 2 columns with enough rows.
function getGridStyle(count: number): React.CSSProperties {
  if (count === 1) {
    return {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gridTemplateRows: '1fr',
    };
  }
  const rows = Math.ceil(count / 2);
  return {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: `repeat(${rows}, 1fr)`,
  };
}

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
      if (ids.length <= 1) return ids; // always keep at least one
      return ids.filter((i) => i !== id);
    });
  };

  const count = terminalIds.length;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#1a1a1a' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          gap: '2px',
          backgroundColor: '#333',
          ...getGridStyle(count),
        }}
      >
        {terminalIds.map((id) => (
          <div
            key={id}
            style={{ overflow: 'hidden', minWidth: 0, minHeight: 0 }}
          >
            <TerminalPane onClose={() => removeTerminal(id)} />
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
