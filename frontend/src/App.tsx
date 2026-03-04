import { useState, useRef } from 'react';
import SplitPane from './components/SplitPane.js';
import { PaneNode, splitNode, closeNode, updateRatio, countLeaves } from './types/pane.js';

const MAX_TERMINALS = 10;

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
  const [tree, setTree] = useState<PaneNode>({ type: 'leaf', id: 1 });
  const nextId = useRef<number>(2);

  const count = countLeaves(tree);
  const canSplit = count < MAX_TERMINALS;

  const handleSplit = (id: number, direction: 'h' | 'v') => {
    const newId = nextId.current++;
    setTree((prev) => splitNode(prev, id, direction, newId));
  };

  const handleClose = (id: number) => {
    setTree((prev) => {
      const result = closeNode(prev, id);
      return result ?? prev;
    });
  };

  const handleRatioChange = (path: string[], ratio: number) => {
    setTree((prev) => updateRatio(prev, path, ratio));
  };

  const handleAddTerminal = () => {
    if (!canSplit) return;
    // Find the rightmost leaf to split into
    let node: PaneNode = tree;
    while (node.type === 'split') node = node.b;
    handleSplit(node.id, 'h');
  };

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

        {canSplit && (
          <button
            onClick={handleAddTerminal}
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

      {/* Split pane tree */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <SplitPane
          node={tree}
          path={[]}
          canSplit={canSplit}
          onSplit={handleSplit}
          onClose={handleClose}
          onRatioChange={handleRatioChange}
          isOnlyPane={count === 1}
        />
      </div>
    </div>
  );
}
