"use client";

import { useSplitStore, type WorkspaceView } from '@/stores/splitStore';

const viewModes: { id: WorkspaceView; label: string; icon: React.ReactNode }[] = [
  {
    id: 'doc',
    label: '文档',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'prototype',
    label: '原型',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    id: 'split',
    label: '对照',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export function ViewSwitcher() {
  const { workspaceView, setWorkspaceView, openSplit } = useSplitStore();

  const handleViewChange = (viewId: WorkspaceView) => {
    if (viewId === 'split') {
      // Open split view with equal ratio
      openSplit({
        mode: 'equal',
        leftRatio: 0.5,
        leftContent: 'doc',
        rightContent: 'prototype',
      });
    } else {
      setWorkspaceView(viewId);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-[var(--nav-hover)] rounded-lg p-1">
      {viewModes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => handleViewChange(mode.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition ${
            workspaceView === mode.id
              ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          {mode.icon}
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
