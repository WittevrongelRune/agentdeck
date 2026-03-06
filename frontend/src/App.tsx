import { useState, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import SplitPane from './components/SplitPane.js';
import TerminalPane from './components/TerminalPane.js';
import {
  PaneNode,
  splitNode,
  closeNode,
  updateRatio,
  countLeaves,
  computeLayout,
  swapLeaves,
} from './types/pane.js';

const MAX_TERMINALS = 10;
const DIVIDER_PX = 4;

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
  const [allIds, setAllIds] = useState<number[]>([1]);
  const [dragId, setDragId] = useState<number | null>(null);
  const nextId = useRef<number>(2);

  const count = countLeaves(tree);
  const canSplit = count < MAX_TERMINALS;
  const canDrag = count > 1;
  const layout = computeLayout(tree);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleSplit = (id: number, direction: 'h' | 'v') => {
    const newId = nextId.current++;
    setAllIds(prev => [...prev, newId]);
    setTree(prev => splitNode(prev, id, direction, newId));
  };

  const handleClose = (id: number) => {
    setTree(prev => closeNode(prev, id) ?? prev);
    setAllIds(prev => prev.filter(i => i !== id));
  };

  const handleRatioChange = (path: string[], ratio: number) => {
    setTree(prev => updateRatio(prev, path, ratio));
  };

  const handleAddTerminal = () => {
    if (!canSplit) return;
    let node: PaneNode = tree;
    while (node.type === 'split') node = node.b;
    handleSplit(node.id, 'h');
  };

  const handleDragStart = (event: DragStartEvent) => {
    setDragId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTree(prev => swapLeaves(prev, active.id as number, over.id as number));
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0e1a' }}>
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

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {allIds.map(id => {
            const rect = layout.get(id);
            const visible = rect !== undefined;
            return (
              <div
                key={id}
                style={{
                  position: 'absolute',
                  left:   visible ? `calc(${rect!.left}% + ${rect!.left > 0 ? DIVIDER_PX / 2 : 0}px)` : '-9999px',
                  top:    visible ? `calc(${rect!.top}%  + ${rect!.top  > 0 ? DIVIDER_PX / 2 : 0}px)` : '-9999px',
                  width:  visible ? `calc(${rect!.width}% - ${rect!.left > 0 ? DIVIDER_PX / 2 : 0}px - ${rect!.left + rect!.width < 100 ? DIVIDER_PX / 2 : 0}px)` : '0',
                  height: visible ? `calc(${rect!.height}% - ${rect!.top > 0 ? DIVIDER_PX / 2 : 0}px - ${rect!.top + rect!.height < 100 ? DIVIDER_PX / 2 : 0}px)` : '0',
                  overflow: 'hidden',
                }}
              >
                <TerminalPane
                  id={id}
                  canSplit={canSplit}
                  canDrag={canDrag}
                  onSplitH={() => handleSplit(id, 'h')}
                  onSplitV={() => handleSplit(id, 'v')}
                  onClose={count === 1 ? undefined : () => handleClose(id)}
                />
              </div>
            );
          })}

          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <SplitPane
              node={tree}
              path={[]}
              onRatioChange={handleRatioChange}
            />
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {dragId !== null ? (
            <div style={{
              padding: '4px 10px',
              background: '#0d1117',
              border: '1px solid #22c55e',
              borderRadius: '4px',
              color: '#22c55e',
              fontFamily: "'Fira Code', monospace",
              fontSize: '11px',
              opacity: 0.9,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}>
              terminal {dragId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
