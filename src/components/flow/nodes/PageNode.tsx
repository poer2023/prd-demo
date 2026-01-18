"use client";

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { PageNodeData } from '@/lib/flow/types';

interface PageNodeProps {
  data: PageNodeData;
  selected?: boolean;
}

function PageNodeComponent({ data, selected }: PageNodeProps) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white dark:bg-gray-800 min-w-[150px] ${
        selected
          ? 'border-blue-500 shadow-lg'
          : 'border-gray-200 dark:border-gray-600'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{data.label}</div>
          {data.path && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{data.path}</div>
          )}
        </div>
      </div>

      {data.description && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 border-t pt-2">
          {data.description}
        </div>
      )}

      {data.components && data.components.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.components.slice(0, 3).map((comp, i) => (
            <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              {comp}
            </span>
          ))}
          {data.components.length > 3 && (
            <span className="text-xs text-gray-400">+{data.components.length - 3}</span>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

export const PageNode = memo(PageNodeComponent);
