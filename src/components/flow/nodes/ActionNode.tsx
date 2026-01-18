"use client";

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { ActionNodeData } from '@/lib/flow/types';

interface ActionNodeProps {
  data: ActionNodeData;
  selected?: boolean;
}

function ActionNodeComponent({ data, selected }: ActionNodeProps) {
  return (
    <div
      className={`px-4 py-2 rounded-full border-2 bg-green-50 dark:bg-green-900/20 min-w-[120px] ${
        selected
          ? 'border-green-500 shadow-lg'
          : 'border-green-300 dark:border-green-600'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="flex items-center justify-center gap-2">
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div className="text-center">
          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{data.label}</div>
          {data.action && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{data.action}</div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

export const ActionNode = memo(ActionNodeComponent);
