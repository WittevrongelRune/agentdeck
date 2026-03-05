import { useRef } from 'react';
import { PaneNode } from '../types/pane.js';

interface SplitPaneProps {
  node: PaneNode;
  path: string[];
  onRatioChange: (path: string[], ratio: number) => void;
}

/**
 * Renders only the dividers for a split-pane tree.
 * Terminal content is rendered separately as absolutely-positioned layers
 * so TerminalPane components never unmount when the tree changes.
 */
export default function SplitPane({ node, path, onRatioChange }: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (node.type === 'leaf') {
    return null;
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
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        pointerEvents: 'none',
      }}
    >
      {/* Child A sub-tree dividers */}
      <div style={{
        flex: `0 0 ${aSize}%`,
        position: 'relative',
        pointerEvents: 'none',
      }}>
        <SplitPane node={node.a} path={[...path, 'a']} onRatioChange={onRatioChange} />
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
          zIndex: 20,
          pointerEvents: 'all',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#22c55e'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#1e2d3d'; }}
      />

      {/* Child B sub-tree dividers */}
      <div style={{
        flex: `0 0 ${bSize}%`,
        position: 'relative',
        pointerEvents: 'none',
      }}>
        <SplitPane node={node.b} path={[...path, 'b']} onRatioChange={onRatioChange} />
      </div>
    </div>
  );
}
