"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { getPrompt, type PromptType } from '@/lib/prompts/templates';
import { getActiveSpec } from '@/lib/specs/store';
import type { DesignSpec } from '@/lib/specs/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: string[]; // base64 images
}

interface ImagePreview {
  file: File;
  preview: string;
}

interface FloatingChatProps {
  onInsertContent?: (content: string) => void;
  existingContent?: string;
}

export function FloatingChat({ onInsertContent, existingContent }: FloatingChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [promptType, setPromptType] = useState<PromptType>('custom');
  const [activeSpec, setActiveSpec] = useState<DesignSpec | null>(null);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setActiveSpec(getActiveSpec());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: ImagePreview[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview });
      }
    });

    setImages(prev => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const convertImagesToBase64 = async (): Promise<string[]> => {
    const base64Images: string[] = [];
    for (const img of images) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(img.file);
      });
      base64Images.push(base64);
    }
    return base64Images;
  };

  const sendMessage = async () => {
    if ((!input.trim() && images.length === 0) || loading) return;

    const base64Images = await convertImagesToBase64();

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
      images: base64Images.length > 0 ? base64Images : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    // Clean up image previews
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setLoading(true);
    setStreaming(true);

    const assistantMessage: Message = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const storedConfig = localStorage.getItem('llm-settings');
      if (!storedConfig) {
        throw new Error('请先在设置页面配置 LLM');
      }
      const config = JSON.parse(storedConfig);

      const systemPrompt = getPrompt(promptType, {
        spec: activeSpec,
        existingContent,
      });

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: input },
      ];

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

  const unreadCount = messages.filter(m => m.role === 'assistant').length;

  // Collapsed state - floating button
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--foreground)] text-[var(--background)] shadow-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
        title="打开 AI 助手"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  // Expanded state - floating dialog
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[700px] max-w-[90vw] bg-[var(--background)] rounded-lg shadow-2xl border border-[var(--border-color)] z-50 flex flex-col transition-all duration-300"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-xl z-10 flex items-center justify-center">
          <div className="text-blue-500 font-medium">拖拽图片到这里</div>
        </div>
      )}

      {/* Header */}
      <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between flex-shrink-0">
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
            className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]"
          >
            清空
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded"
            title="收起"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[50vh]">
        {messages.length === 0 && (
          <div className="text-center text-[var(--text-muted)] text-sm py-8">
            <p>👋 你好！我是 AI 助手</p>
            <p className="mt-2">选择上方的模式，然后输入你的需求</p>
            <p className="mt-1 text-xs">支持拖拽或点击上传图片</p>
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
              {/* Image previews for user messages */}
              {msg.images && msg.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {msg.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`上传的图片 ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded border border-white/20"
                    />
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap break-words">{msg.content || (streaming ? '思考中...' : '')}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Insert Button */}
      {onInsertContent && messages.some(m => m.role === 'assistant' && m.content) && (
        <div className="px-3 pb-2 flex-shrink-0">
          <button
            onClick={insertLastResponse}
            className="w-full text-xs py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            📋 插入最后回复到编辑器
          </button>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.preview}
                  alt={`预览 ${index + 1}`}
                  className="w-16 h-16 object-cover rounded border border-[var(--border-color)]"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[var(--border-color)] flex-shrink-0">
        <div className="flex gap-2 items-end">
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded-md transition-colors"
            title="上传图片"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入需求描述... (支持拖拽上传图片)"
            rows={2}
            className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-sm text-[var(--foreground)] resize-none"
            disabled={loading}
          />

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={loading || (!input.trim() && images.length === 0)}
            className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
}
