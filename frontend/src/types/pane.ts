export type LeafNode = { type: 'leaf'; id: number };
export type SplitNode = {
  type: 'split';
  direction: 'h' | 'v'; // 'h' = side by side (vertical divider), 'v' = top/bottom (horizontal divider)
  ratio: number;         // fraction [0.1, 0.9] that child 'a' occupies
  a: PaneNode;
  b: PaneNode;
};
export type PaneNode = LeafNode | SplitNode;

/** Count all leaf nodes in the tree */
export function countLeaves(node: PaneNode): number {
  if (node.type === 'leaf') return 1;
  return countLeaves(node.a) + countLeaves(node.b);
}

/**
 * Replace the leaf with targetId with a SplitNode containing the original
 * leaf as child 'a' and a new leaf (newId) as child 'b'.
 */
export function splitNode(
  node: PaneNode,
  targetId: number,
  direction: 'h' | 'v',
  newId: number,
): PaneNode {
  if (node.type === 'leaf') {
    if (node.id !== targetId) return node;
    return { type: 'split', direction, ratio: 0.5, a: node, b: { type: 'leaf', id: newId } };
  }
  return { ...node, a: splitNode(node.a, targetId, direction, newId), b: splitNode(node.b, targetId, direction, newId) };
}

/**
 * Remove the leaf with targetId from the tree.
 * If the parent is a SplitNode, the sibling replaces the parent.
 * Returns null if the root itself is the target leaf.
 */
export function closeNode(node: PaneNode, targetId: number): PaneNode | null {
  if (node.type === 'leaf') {
    return node.id === targetId ? null : node;
  }

  // Check if either direct child is the target leaf
  if (node.a.type === 'leaf' && node.a.id === targetId) return node.b;
  if (node.b.type === 'leaf' && node.b.id === targetId) return node.a;

  // Recurse into children
  const newA = closeNode(node.a, targetId);
  const newB = closeNode(node.b, targetId);

  // If a child became null (shouldn't happen since we handle leaves above, but safety)
  if (newA === null) return newB;
  if (newB === null) return newA;

  return { ...node, a: newA, b: newB };
}

/**
 * Update the ratio of a SplitNode at the given path.
 * Path is an array of 'a' | 'b' steps from the root.
 */
export function updateRatio(node: PaneNode, path: string[], ratio: number): PaneNode {
  if (node.type === 'leaf') return node;
  if (path.length === 0) {
    return { ...node, ratio };
  }
  const [head, ...tail] = path;
  if (head === 'a') return { ...node, a: updateRatio(node.a, tail, ratio) };
  return { ...node, b: updateRatio(node.b, tail, ratio) };
}
