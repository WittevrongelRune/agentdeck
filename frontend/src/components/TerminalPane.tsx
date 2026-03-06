import { useRef, useState } from 'react';
import { useTerminal } from '../hooks/useTerminal.js';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import '@xterm/xterm/css/xterm.css';

interface TerminalPaneProps {
  id: number;
  canSplit: boolean;
  canDrag: boolean;
  onSplitH: () => void;
  onSplitV: () => void;
  onClose?: () => void;
}

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SplitHIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);

const SplitVIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
);

function HeaderButton({
  onClick,
  title,
  visible,
  children,
}: {
  onClick: () => void;
  title: string;
  visible: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
        borderRadius: '3px',
        border: 'none',
        background: visible ? '#1e2d3d' : 'transparent',
        color: visible ? '#94a3b8' : 'transparent',
        cursor: 'pointer',
        transition: 'all 150ms ease',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

export default function TerminalPane({ id, canSplit, canDrag, onSplitH, onSplitV, onClose }: TerminalPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  useTerminal(containerRef);

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id });

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id,
    disabled: !canDrag,
  });

  return (
    <div
      ref={setDropRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        border: isOver ? '2px solid #22c55e' : '2px solid transparent',
        borderRadius: '2px',
        opacity: isDragging ? 0.5 : 1,
        transition: 'border-color 100ms ease, opacity 150ms ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={setDragRef}
        {...listeners}
        {...attributes}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          height: '28px',
          minHeight: '28px',
          background: '#0d1117',
          borderBottom: '1px solid #1e2d3d',
          flexShrink: 0,
          gap: '4px',
          cursor: canDrag ? (isDragging ? 'grabbing' : 'grab') : 'default',
          userSelect: 'none',
        }}
      >
        <span style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: '11px',
          color: '#475569',
          flex: 1,
        }}>
          terminal <span style={{ color: '#64748b' }}>{id}</span>
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {canSplit && (
            <>
              <HeaderButton onClick={onSplitH} title="Split right" visible={hovered}>
                <SplitHIcon />
              </HeaderButton>
              <HeaderButton onClick={onSplitV} title="Split down" visible={hovered}>
                <SplitVIcon />
              </HeaderButton>
            </>
          )}
          {onClose && (
            <HeaderButton onClick={onClose} title="Close terminal" visible={hovered}>
              <CloseIcon />
            </HeaderButton>
          )}
        </div>
      </div>

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
