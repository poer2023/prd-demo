/**
 * 权限系统原型
 * 展示工具审批和权限模式切换
 */

'use client';

import { useState } from 'react';

type PermissionMode = 'default' | 'acceptedits' | 'plan' | 'bypass';

const permissionModes: { id: PermissionMode; label: string; icon: string; desc: string }[] = [
  { id: 'default', label: 'Default', icon: '🔒', desc: '所有工具需要审批' },
  { id: 'acceptedits', label: 'Accept Edits', icon: '✏️', desc: '自动批准编辑操作' },
  { id: 'plan', label: 'Plan', icon: '📋', desc: '仅规划模式，不执行' },
  { id: 'bypass', label: 'Bypass', icon: '⚡', desc: '自动批准所有操作' },
];

interface ToolRequest {
  id: string;
  type: 'bash' | 'write' | 'read' | 'edit';
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function TelegramPermissionsPrototype() {
  const [mode, setMode] = useState<PermissionMode>('default');
  const [requests, setRequests] = useState<ToolRequest[]>([
    {
      id: '1',
      type: 'bash',
      title: 'Bash 命令',
      content: 'npm install express cors',
      status: 'pending',
    },
    {
      id: '2',
      type: 'write',
      title: '写入文件',
      content: 'src/server.ts (创建新文件)',
      status: 'pending',
    },
  ]);

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'approved' as const } : r
    ));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'rejected' as const } : r
    ));
  };

  const handleApproveAll = () => {
    setRequests(prev => prev.map(r => ({ ...r, status: 'approved' as const })));
    setMode('bypass');
  };

  const getTypeIcon = (type: ToolRequest['type']) => {
    switch (type) {
      case 'bash': return (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
      case 'write': return (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
      case 'read': return (
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
      case 'edit': return (
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      );
    }
  };

  const getStatusBadge = (status: ToolRequest['status']) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">待审批</span>;
      case 'approved': return <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">已批准</span>;
      case 'rejected': return <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">已拒绝</span>;
    }
  };

  return (
    <div className="w-[375px] h-[667px] mx-auto bg-[#E5DDD5] rounded-[40px] overflow-hidden shadow-xl border-[8px] border-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-[#2AABEE] px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <div className="text-white font-medium">权限管理</div>
            <div className="text-white/70 text-xs mt-0.5">
              当前模式: {permissionModes.find(m => m.id === mode)?.icon} {permissionModes.find(m => m.id === mode)?.label}
            </div>
          </div>
        </div>
      </div>

      {/* Permission Mode Selector */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="text-sm font-medium text-gray-700 mb-3">切换权限模式</div>
          <div className="grid grid-cols-2 gap-2">
            {permissionModes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`
                  p-3 rounded-xl text-left transition-all
                  ${mode === m.id
                    ? 'bg-[#2AABEE]/10 border-2 border-[#2AABEE]'
                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{m.icon}</span>
                  <span className="font-medium text-sm text-gray-900">{m.label}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tool Requests */}
        <div className="p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">
              工具使用请求
            </div>
            {requests.some(r => r.status === 'pending') && (
              <button
                onClick={handleApproveAll}
                className="text-xs text-[#2AABEE] hover:text-[#229ED9] font-medium"
              >
                全部批准
              </button>
            )}
          </div>

          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className={`
                  p-4 rounded-xl border transition-all
                  ${req.status === 'pending'
                    ? 'border-yellow-300 bg-yellow-50'
                    : req.status === 'approved'
                    ? 'border-green-300 bg-green-50'
                    : 'border-red-300 bg-red-50'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(req.type)}
                    <span className="font-medium text-sm text-gray-900">{req.title}</span>
                  </div>
                  {getStatusBadge(req.status)}
                </div>

                <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-mono text-xs mb-3 overflow-x-auto">
                  <code>{req.content}</code>
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      批准
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            ))}

            {requests.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                暂无待审批的请求
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 bg-white text-xs text-gray-500 text-center border-t border-gray-200 flex-shrink-0">
        ⏱️ 超时未响应将在 60 秒后自动拒绝
      </div>
    </div>
  );
}
