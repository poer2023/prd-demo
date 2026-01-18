"use client";

import { useState, useRef, useEffect } from 'react';
import { getPrompt, type PromptType } from '@/lib/prompts/templates';
import { getActiveSpec } from '@/lib/specs/store';
import type { DesignSpec } from '@/lib/specs/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  onInsertContent?: (content: string) => void;
  existingContent?: string;
  className?: string;
}

export function ChatPanel({ onInsertContent, existingContent, className = '' }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [promptType, setPromptType] = useState<PromptType>('custom');
  const [activeSpec, setActiveSpec] = useState<DesignSpec | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveSpec(getActiveSpec());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setStreaming(true);

    // 准备 AI 消息占位
    const assistantMessage: Message = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // 获取 LLM 配置
      const storedConfig = localStorage.getItem('llm-settings');
      if (!storedConfig) {
        throw new Error('请先在设置页面配置 LLM');
      }
      const config = JSON.parse(storedConfig);

      // 构建消息
      const systemPrompt = getPrompt(promptType, {
        spec: activeSpec,
        existingContent,
      });

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: input },
      ];

      // 调用流式 API
      const response = await fetch('/api/llm/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, config }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                content += data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (updated[lastIdx]?.role === 'assistant') {
                    updated[lastIdx] = { ...updated[lastIdx], content };
                  }
                  return updated;
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.role === 'assistant') {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: `错误: ${error instanceof Error ? error.message : '请求失败'}`,
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const insertLastResponse = () => {
    const lastAssistant = messages.filter(m => m.role === 'assistant').pop();
    if (lastAssistant && onInsertContent) {
      onInsertContent(lastAssistant.content);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[var(--card-bg)] ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--foreground)]">AI 助手</span>
          {activeSpec && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
              {activeSpec.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={promptType}
            onChange={(e) => setPromptType(e.target.value as PromptType)}
            className="text-xs px-2 py-1 bg-[var(--background)] border border-[var(--border-color)] rounded"
          >
            <option value="custom">自由对话</option>
            <option value="prd">生成 PRD</option>
            <option value="prototype">原型建议</option>
            <option value="continue">续写内容</option>
            <option value="refine">优化内容</option>
          </select>
          <button
            onClick={clearChat}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            清空
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-[var(--muted-foreground)] text-sm py-8">
            <p>👋 你好！我是 AI 助手</p>
            <p className="mt-2">选择上方的模式，然后输入你的需求</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-[var(--background)] text-[var(--foreground)] border border-[var(--border-color)]'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{msg.content || (streaming ? '思考中...' : '')}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Insert Button */}
      {onInsertContent && messages.some(m => m.role === 'assistant' && m.content) && (
        <div className="px-3 pb-2">
          <button
            onClick={insertLastResponse}
            className="w-full text-xs py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            📋 插入最后回复到编辑器
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入需求描述..."
            rows={2}
            className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-sm text-[var(--foreground)] resize-none"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
}
