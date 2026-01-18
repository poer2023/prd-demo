"use client";

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { StartEndNodeData } from '@/lib/flow/types';

interface StartNodeProps {
  data: StartEndNodeData;
  selected?: boolean;
}

function StartNodeComponent({ data, selected }: StartNodeProps) {
  return (
    <div
      className={`px-4 py-2 rounded-full border-2 bg-gray-100 dark:bg-gray-700 ${
        selected
          ? 'border-gray-500 shadow-lg'
          : 'border-gray-300 dark:border-gray-500'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {data.label || 'Start'}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

export const StartNode = memo(StartNodeComponent);

interface EndNodeProps {
  data: StartEndNodeData;
  selected?: boolean;
}

function EndNodeComponent({ data, selected }: EndNodeProps) {
  return (
    <div
      className={`px-4 py-2 rounded-full border-2 bg-gray-100 dark:bg-gray-700 ${
        selected
          ? 'border-gray-500 shadow-lg'
          : 'border-gray-300 dark:border-gray-500'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {data.label || 'End'}
        </span>
      </div>
    </div>
  );
}

export const EndNode = memo(EndNodeComponent);
