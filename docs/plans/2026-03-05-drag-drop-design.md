# Design: Terminal Drag-and-Drop Swap

**Date:** 2026-03-05
**Status:** Approved

## Summary

Add drag-and-drop reordering to terminal panes. Dragging terminal A onto terminal B swaps their positions in the split-pane layout tree. The PTY sessions are unaffected — only the layout changes.

## Approach

Use **dnd-kit** (`@dnd-kit/core`) — a lightweight, accessible drag-and-drop library for React. No other dependencies needed.

## Architecture

The terminal area is wrapped in dnd-kit's `DndContext`. Each terminal pane is simultaneously a drag source (`useDraggable`) and a drop target (`useDroppable`), both keyed by terminal id.

On drag end, `swapLeaves(tree, dragId, dropId)` swaps the two leaf ids in the binary tree. `computeLayout()` recomputes the absolute positions — the terminals reposition without remounting.

## Visual Feedback

- **Dragging**: header gets `cursor: grabbing`, outer container gets reduced opacity
- **Drop target**: hovered terminal gets a green (`#22c55e`) inset border highlight
- **Ghost**: `DragOverlay` renders a floating semi-transparent chip showing the terminal label

## Changes

| File | Change |
|------|--------|
| `frontend/src/types/pane.ts` | Add `swapLeaves(node, idA, idB): PaneNode` |
| `frontend/src/App.tsx` | Wrap terminal area in `DndContext`, `DragOverlay`; handle `onDragEnd` |
| `frontend/src/components/TerminalPane.tsx` | Apply `useDraggable` to header, `useDroppable` to outer container; show drop highlight |
| `frontend/package.json` | Add `@dnd-kit/core` dependency |

## Constraints

- Dragging the header should not trigger when clicking the split/close buttons — dnd-kit handles this via the `activationConstraint` (require a few pixels of movement before drag starts)
- No drag-and-drop when only one terminal is open (nothing to swap with)
- Drop onto self is a no-op
