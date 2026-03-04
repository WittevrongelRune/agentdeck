import { useRef } from 'react';
import { PaneNode } from '../types/pane.js';
import TerminalPane from './TerminalPane.js';

interface SplitPaneProps {
  node: PaneNode;
  path: string[];
  canSplit: boolean;
  onSplit: (id: number, direction: 'h' | 'v') => void;
  onClose: (id: number) => void;
  onRatioChange: (path: string[], ratio: number) => void;
  isOnlyPane: boolean;
}

export default function SplitPane({
  node,
  path,
  canSplit,
  onSplit,
  onClose,
  onRatioChange,
  isOnlyPane,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (node.type === 'leaf') {
    return (
      <TerminalPane
        id={node.id}
        canSplit={canSplit}
        onSplitH={() => onSplit(node.id, 'h')}
        onSplitV={() => onSplit(node.id, 'v')}
        onClose={isOnlyPane ? undefined : () => onClose(node.id)}
      />
    );
  }

  const isHorizontal = node.direction === 'h';
  const aSize = node.ratio * 100;
  const bSize = (1 - node.ratio) * 100;

  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      let ratio: number;
      if (isHorizontal) {
        ratio = (moveEvent.clientX - rect.left) / rect.width;
      } else {
        ratio = (moveEvent.clientY - rect.top) / rect.height;
      }
      ratio = Math.min(0.9, Math.max(0.1, ratio));
      onRatioChange(path, ratio);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        overflow: 'hidden',
      }}
    >
      {/* Child A */}
      <div style={{ flex: `0 0 calc(${aSize}% - 2px)`, overflow: 'hidden', minWidth: 0, minHeight: 0 }}>
        <SplitPane
          node={node.a}
          path={[...path, 'a']}
          canSplit={canSplit}
          onSplit={onSplit}
          onClose={onClose}
          onRatioChange={onRatioChange}
          isOnlyPane={false}
        />
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleDividerMouseDown}
        style={{
          flexShrink: 0,
          width: isHorizontal ? '4px' : '100%',
          height: isHorizontal ? '100%' : '4px',
          background: '#1e2d3d',
          cursor: isHorizontal ? 'col-resize' : 'row-resize',
          transition: 'background 150ms ease',
          zIndex: 10,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#22c55e'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#1e2d3d'; }}
      />

      {/* Child B */}
      <div style={{ flex: `0 0 calc(${bSize}% - 2px)`, overflow: 'hidden', minWidth: 0, minHeight: 0 }}>
        <SplitPane
          node={node.b}
          path={[...path, 'b']}
          canSplit={canSplit}
          onSplit={onSplit}
          onClose={onClose}
          onRatioChange={onRatioChange}
          isOnlyPane={false}
        />
      </div>
    </div>
  );
}
