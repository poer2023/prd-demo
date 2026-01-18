"use client";

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PageNode, DecisionNode, ActionNode, StartNode, EndNode } from './nodes';
import type { FlowNode, FlowEdge, FlowNodeType } from '@/lib/flow/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, any> = {
  page: PageNode,
  decision: DecisionNode,
  action: ActionNode,
  start: StartNode,
  end: EndNode,
};

interface FlowEditorProps {
  initialNodes?: FlowNode[];
  initialEdges?: FlowEdge[];
  onNodesChange?: (nodes: FlowNode[]) => void;
  onEdgesChange?: (edges: FlowEdge[]) => void;
  readOnly?: boolean;
}

export function FlowEditor({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  readOnly = false,
}: FlowEditorProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<FlowNodeType>('page');

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges]
  );

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChangeInternal>[0]) => {
      onNodesChangeInternal(changes);
      if (onNodesChange) {
        setTimeout(() => {
          onNodesChange(nodes as FlowNode[]);
        }, 0);
      }
    },
    [onNodesChangeInternal, onNodesChange, nodes]
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChangeInternal>[0]) => {
      onEdgesChangeInternal(changes);
      if (onEdgesChange) {
        setTimeout(() => {
          onEdgesChange(edges as FlowEdge[]);
        }, 0);
      }
    },
    [onEdgesChangeInternal, onEdgesChange, edges]
  );

  const addNode = useCallback(() => {
    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type: selectedNodeType,
      position: { x: 250, y: nodes.length * 100 + 50 },
      data: {
        label: `New ${selectedNodeType}`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [selectedNodeType, nodes.length, setNodes]);

  const clearAll = useCallback(() => {
    if (confirm('Clear all nodes and edges?')) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  const autoLayout = useCallback(() => {
    const layoutNodes = [...nodes];
    const nodeMap = new Map(layoutNodes.map(n => [n.id, n]));
    const startNodes = layoutNodes.filter(n => n.type === 'start');
    const visited = new Set<string>();
    let currentY = 50;
    const levelWidth = 200;
    const levelHeight = 120;

    const layoutLevel = (nodeIds: string[], level: number) => {
      const levelNodes = nodeIds.filter(id => !visited.has(id));
      if (levelNodes.length === 0) return;

      const startX = 250 - ((levelNodes.length - 1) * levelWidth) / 2;

      levelNodes.forEach((id, index) => {
        visited.add(id);
        const node = nodeMap.get(id);
        if (node) {
          node.position = {
            x: startX + index * levelWidth,
            y: currentY,
          };
        }
      });

      currentY += levelHeight;

      const nextLevel = edges
        .filter(e => levelNodes.includes(e.source))
        .map(e => e.target)
        .filter(id => !visited.has(id));

      if (nextLevel.length > 0) {
        layoutLevel([...new Set(nextLevel)], level + 1);
      }
    };

    if (startNodes.length > 0) {
      layoutLevel(startNodes.map(n => n.id), 0);
    } else {
      layoutNodes.forEach((node, index) => {
        node.position = { x: 250, y: 50 + index * levelHeight };
      });
    }

    setNodes([...layoutNodes]);
  }, [nodes, edges, setNodes]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : handleNodesChange}
        onEdgesChange={readOnly ? undefined : handleEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bg-white dark:!bg-gray-800"
        />

        {!readOnly && (
          <Panel position="top-left" className="flex gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <select
              value={selectedNodeType}
              onChange={(e) => setSelectedNodeType(e.target.value as FlowNodeType)}
              className="px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="page">Page</option>
              <option value="decision">Decision</option>
              <option value="action">Action</option>
              <option value="start">Start</option>
              <option value="end">End</option>
            </select>
            <button
              onClick={addNode}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Add
            </button>
            <button
              onClick={autoLayout}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Layout
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              Clear
            </button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
