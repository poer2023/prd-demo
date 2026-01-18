"use client";

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { DecisionNodeData } from '@/lib/flow/types';

interface DecisionNodeProps {
  data: DecisionNodeData;
  selected?: boolean;
}

function DecisionNodeComponent({ data, selected }: DecisionNodeProps) {
  return (
    <div
      className={`relative ${selected ? 'drop-shadow-lg' : ''}`}
      style={{ width: 120, height: 80 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      {/* Diamond shape */}
      <div
        className={`absolute inset-0 rotate-45 rounded-lg border-2 bg-amber-50 dark:bg-amber-900/20 ${
          selected
            ? 'border-amber-500'
            : 'border-amber-300 dark:border-amber-600'
        }`}
        style={{ margin: '10px' }}
      />

      {/* Content (not rotated) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-2">
          <div className="font-medium text-xs text-gray-900 dark:text-gray-100">{data.label}</div>
          {data.condition && (
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{data.condition}</div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" id="bottom" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400" id="right" />
      <Handle type="source" position={Position.Left} className="!bg-gray-400" id="left" />
    </div>
  );
}

export const DecisionNode = memo(DecisionNodeComponent);
