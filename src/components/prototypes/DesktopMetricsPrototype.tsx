/**
 * Desktop 指标面板原型
 * 展示实时监控数据 - 浅色模式
 */

'use client';

import { useState, useEffect } from 'react';

interface MetricCard {
  label: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export function DesktopMetricsPrototype() {
  const [metrics, setMetrics] = useState<MetricCard[]>([
    { label: '今日消息', value: '1,234', change: '+12%', changeType: 'up', icon: <MessageIcon /> },
    { label: 'API 调用', value: '856', change: '+8%', changeType: 'up', icon: <ApiIcon /> },
    { label: '平均响应', value: '1.2s', change: '-15%', changeType: 'down', icon: <SpeedIcon /> },
    { label: '活跃用户', value: '42', change: '+3', changeType: 'up', icon: <UsersIcon /> },
  ]);

  const [systemStats, setSystemStats] = useState({
    cpu: 23,
    memory: 45,
    network: '2.3 MB/s',
  });

  const [recentLogs] = useState([
    { level: 'info', time: '14:32:01', msg: '[TelegramHandler] Message received from user 123456' },
    { level: 'info', time: '14:32:02', msg: '[ClaudeManager] Query sent to Claude API' },
    { level: 'warn', time: '14:32:03', msg: '[RateLimiter] User 789 approaching rate limit' },
    { level: 'info', time: '14:32:05', msg: '[ToolHandler] Bash command approved' },
    { level: 'error', time: '14:32:08', msg: '[Storage] Redis connection timeout, retrying...' },
  ]);

  // 模拟实时更新
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map((m, i) => ({
        ...m,
        value: i === 0
          ? String(parseInt(m.value.replace(',', '')) + Math.floor(Math.random() * 3)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          : m.value
      })));

      setSystemStats(prev => ({
        cpu: Math.min(100, Math.max(10, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.min(100, Math.max(20, prev.memory + (Math.random() - 0.5) * 5)),
        network: `${(Math.random() * 5).toFixed(1)} MB/s`,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getLogLevelStyle = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600';
      case 'warn': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      {/* Window frame */}
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 text-center text-sm font-medium text-gray-600">
          C2ME Dashboard - 指标面板
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-3">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#2AABEE]/10 flex items-center justify-center text-[#2AABEE]">
                  {metric.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{metric.label}</span>
                {metric.change && (
                  <span className={`text-xs font-medium ${
                    metric.changeType === 'up' ? 'text-green-600' :
                    metric.changeType === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {metric.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* System Stats */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-900 mb-4">系统资源</div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500">CPU</span>
                <span className="text-gray-900 font-medium">{systemStats.cpu.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 rounded-full"
                  style={{ width: `${systemStats.cpu}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500">内存</span>
                <span className="text-gray-900 font-medium">{systemStats.memory.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 rounded-full"
                  style={{ width: `${systemStats.memory}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500">网络</span>
                <span className="text-gray-900 font-medium">{systemStats.network}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 w-1/3 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-900">实时日志</div>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">Info</span>
              <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-600 rounded-full">Warn</span>
              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">Error</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs space-y-1.5 max-h-32 overflow-y-auto border border-gray-200">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-gray-400">{log.time}</span>
                <span className={`font-medium ${getLogLevelStyle(log.level)}`}>[{log.level.toUpperCase()}]</span>
                <span className="text-gray-700">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Status */}
        <div className="grid grid-cols-3 gap-3">
          <ServiceStatus name="Bot 服务" status="running" />
          <ServiceStatus name="Redis" status="connected" />
          <ServiceStatus name="Claude API" status="healthy" />
        </div>
      </div>
    </div>
  );
}

function ServiceStatus({ name, status }: { name: string; status: string }) {
  return (
    <div className="bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-200 shadow-sm">
      <div className="relative">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
      </div>
      <div>
        <div className="text-sm font-medium text-gray-900">{name}</div>
        <div className="text-xs text-green-600">{status === 'running' ? '运行中' : status === 'connected' ? '已连接' : '正常'}</div>
      </div>
    </div>
  );
}

// Icon Components
function MessageIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function ApiIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function SpeedIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
