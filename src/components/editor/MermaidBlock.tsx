"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

interface MermaidBlockProps {
  code: string;
  isLoggedIn?: boolean;
  onEdit?: () => void;
}

// 初始化 mermaid
let mermaidInitialized = false;

export function MermaidBlock({ code, isLoggedIn = true, onEdit }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 渲染 Mermaid 图表
  useEffect(() => {
    const renderChart = async () => {
      if (!code) return;

      try {
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral',
            securityLevel: 'loose',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
            flowchart: {
              htmlLabels: true,
              curve: 'basis',
            },
          });
          mermaidInitialized = true;
        }

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, code);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('图表渲染失败');
      }
    };

    renderChart();
  }, [code]);

  // 滚轮缩放 - 使用原生事件阻止全局滚动
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setScale(prev => Math.min(Math.max(prev + delta, 0.3), 4));
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelNative);
    };
  }, []);

  // 拖动开始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  // 拖动中
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  // 拖动结束
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 重置视图
  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
        <pre className="text-xs overflow-auto bg-red-100 dark:bg-red-900/30 p-2 rounded">{code}</pre>
      </div>
    );
  }

  return (
    <>
      {/* 图表容器 */}
      <div className="my-4 rounded-xl bg-[#ebebeb] dark:bg-[#151515] overflow-hidden group relative">
        {/* 浮动工具栏 - hover 时显示 */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[var(--text-muted)]">
          {scale !== 1 && (
            <span>{Math.round(scale * 100)}%</span>
          )}
          <button
            onClick={() => setScale(prev => Math.max(prev - 0.2, 0.3))}
            className="hover:text-[var(--foreground)] transition"
            title="缩小"
          >
            −
          </button>
          <button
            onClick={resetView}
            className="hover:text-[var(--foreground)] transition"
            title="重置"
          >
            重置
          </button>
          <button
            onClick={() => setScale(prev => Math.min(prev + 0.2, 4))}
            className="hover:text-[var(--foreground)] transition"
            title="放大"
          >
            +
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="hover:text-[var(--foreground)] transition"
            title="全屏"
          >
            ⛶
          </button>
          {isLoggedIn && onEdit && (
            <button
              onClick={onEdit}
              className="hover:text-[var(--foreground)] transition"
              title="编辑"
            >
              编辑
            </button>
          )}
        </div>

        {/* 图表内容 - 可拖动 */}
        <div
          ref={containerRef}
          className="p-6 overflow-hidden select-none"
          style={{
            height: '400px',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            ref={contentRef}
            className="flex justify-center items-center h-full transition-transform duration-100"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center'
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>

      {/* 大图弹窗 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
              <span className="text-sm text-[var(--foreground)]">流程图预览</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition"
              >
                ✕
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-8 overflow-auto bg-[#ebebeb] dark:bg-[#151515]" style={{ maxHeight: 'calc(90vh - 60px)' }}>
              <div
                className="flex justify-center"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
