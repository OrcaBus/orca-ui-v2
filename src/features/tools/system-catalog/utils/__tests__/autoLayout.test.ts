import { describe, expect, it } from 'vitest';
import type { Edge, Node } from '@xyflow/react';
import { getLayoutedElements, getNodeSize, NODE_DIMENSIONS } from '../autoLayout';

function makeNode(id: string, type = 'pipeline'): Node {
  return { id, type, position: { x: 0, y: 0 }, data: {} };
}

function makeEdge(source: string, target: string): Edge {
  return { id: `${source}-${target}`, source, target };
}

const allFinite = (nodes: Node[]) =>
  nodes.every((node) => Number.isFinite(node.position.x) && Number.isFinite(node.position.y));

describe('getLayoutedElements', () => {
  it('orders a chain left-to-right by increasing x', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'c')];

    const { nodes: laid } = getLayoutedElements(nodes, edges, { direction: 'LR' });
    const byId = Object.fromEntries(laid.map((node) => [node.id, node]));

    expect(byId.a.position.x).toBeLessThan(byId.b.position.x);
    expect(byId.b.position.x).toBeLessThan(byId.c.position.x);
    expect(allFinite(laid)).toBe(true);
  });

  it('stacks a chain top-to-bottom by increasing y when direction is TB', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'c')];

    const { nodes: laid } = getLayoutedElements(nodes, edges, { direction: 'TB' });
    const byId = Object.fromEntries(laid.map((node) => [node.id, node]));

    expect(byId.a.position.y).toBeLessThan(byId.b.position.y);
    expect(byId.b.position.y).toBeLessThan(byId.c.position.y);
  });

  it('assigns finite coordinates to disconnected nodes', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('isolated')];
    const edges = [makeEdge('a', 'b')];

    const { nodes: laid } = getLayoutedElements(nodes, edges);

    expect(laid.find((node) => node.id === 'isolated')).toBeDefined();
    expect(allFinite(laid)).toBe(true);
  });

  it('ignores edges pointing at nodes outside the layout set', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'ghost')];

    const result = getLayoutedElements(nodes, edges);

    expect(allFinite(result.nodes)).toBe(true);
  });

  it('returns the inputs unchanged for an empty node list', () => {
    expect(getLayoutedElements([], []).nodes).toEqual([]);
  });

  it('does not mutate the input nodes', () => {
    const nodes = [makeNode('a')];
    const originalPosition = nodes[0].position;

    getLayoutedElements(nodes, []);

    expect(nodes[0].position).toBe(originalPosition);
    expect(nodes[0].position).toEqual({ x: 0, y: 0 });
  });
});

describe('getNodeSize', () => {
  it('prefers React Flow measured dimensions', () => {
    const node: Node = { ...makeNode('x', 'pipeline'), measured: { width: 333, height: 111 } };
    expect(getNodeSize(node)).toEqual({ width: 333, height: 111 });
  });

  it('falls back to per-type dimensions when unmeasured', () => {
    expect(getNodeSize(makeNode('x', 'aws_sqs'))).toEqual(NODE_DIMENSIONS.aws_sqs);
  });

  it('falls back to the default size for unknown node types', () => {
    expect(getNodeSize(makeNode('x', 'mystery_type'))).toEqual({ width: 200, height: 90 });
  });
});
