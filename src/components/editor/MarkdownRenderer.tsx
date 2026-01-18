"use client";

import { useMemo } from 'react';
import { marked } from 'marked';
import dynamic from 'next/dynamic';
import hljs from 'highlight.js';

// 动态加载 MermaidBlock 避免 SSR 问题
const MermaidBlock = dynamic(
  () => import('./MermaidBlock').then(mod => mod.MermaidBlock),
  { ssr: false, loading: () => <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-xl my-4" /> }
);

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isLoggedIn?: boolean;
  onEditMermaid?: (code: string, index: number) => void;
}

// 生成标题的唯一 ID（用于滚动定位）
function generateHeadingId(text: string, index: number): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `heading-${slug}-${index}`;
}

export function MarkdownRenderer({
  content,
  className = '',
  isLoggedIn = true,
  onEditMermaid
}: MarkdownRendererProps) {
  // 解析内容，分离 mermaid 代码块和普通内容
  const { segments } = useMemo(() => {
    if (!content) return { segments: [] };

    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    const segments: Array<{ type: 'html' | 'mermaid'; content: string; index?: number }> = [];

    let lastIndex = 0;
    let mermaidIndex = 0;
    let headingIndex = 0;
    let firstH1Skipped = false;
    let match;

    // 配置 marked 使用 highlight.js
    marked.setOptions({
      gfm: true,
      breaks: true,
    });

    // 自定义渲染器
    const renderer = new marked.Renderer();

    // 自定义标题渲染器 - 添加 ID 并跳过第一个 H1
    renderer.heading = function({ text, depth }: { text: string; depth: number }) {
      // 跳过第一个 H1 标题（页面顶部已有标题）
      if (depth === 1 && !firstH1Skipped) {
        firstH1Skipped = true;
        return ''; // 不渲染第一个 H1
      }

      const id = generateHeadingId(text, headingIndex++);
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    };

    // 自定义代码块渲染器
    renderer.code = function({ text, lang }: { text: string; lang?: string }) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(text, { language: lang }).value;
          return `<pre class="hljs"><code class="language-${lang}">${highlighted}</code></pre>`;
        } catch {
          // 高亮失败时使用默认渲染
        }
      }
      // 没有语言或高亮失败时，尝试自动检测
      try {
        const highlighted = hljs.highlightAuto(text).value;
        return `<pre class="hljs"><code>${highlighted}</code></pre>`;
      } catch {
        const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre class="hljs"><code>${escaped}</code></pre>`;
      }
    };

    marked.use({ renderer });

    while ((match = mermaidRegex.exec(content)) !== null) {
      // 添加 mermaid 之前的内容
      if (match.index > lastIndex) {
        const beforeContent = content.slice(lastIndex, match.index);
        if (beforeContent.trim()) {
          segments.push({
            type: 'html',
            content: marked.parse(beforeContent) as string
          });
        }
      }

      // 添加 mermaid 代码块
      segments.push({
        type: 'mermaid',
        content: match[1].trim(),
        index: mermaidIndex++
      });

      lastIndex = match.index + match[0].length;
    }

    // 添加剩余内容
    if (lastIndex < content.length) {
      const remainingContent = content.slice(lastIndex);
      if (remainingContent.trim()) {
        segments.push({
          type: 'html',
          content: marked.parse(remainingContent) as string
        });
      }
    }

    return { segments };
  }, [content]);

  return (
    <div className={`markdown-content ${className}`}>
      {segments.map((segment, i) => {
        if (segment.type === 'mermaid') {
          return (
            <MermaidBlock
              key={`mermaid-${i}`}
              code={segment.content}
              isLoggedIn={isLoggedIn}
              onEdit={onEditMermaid ? () => onEditMermaid(segment.content, segment.index!) : undefined}
            />
          );
        }
        return (
          <div
            key={`html-${i}`}
            dangerouslySetInnerHTML={{ __html: segment.content }}
          />
        );
      })}

      <style jsx global>{`
        .markdown-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.2;
          color: var(--foreground);
        }
        .markdown-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
          color: var(--foreground);
        }
        .markdown-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.375rem;
          line-height: 1.4;
          color: var(--foreground);
        }
        .markdown-content p {
          margin-bottom: 0.5rem;
          line-height: 1.7;
          color: var(--foreground);
        }
        .markdown-content ul, .markdown-content ol {
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .markdown-content table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        .markdown-content th, .markdown-content td {
          border: 1px solid var(--border-color);
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .markdown-content th {
          background: var(--nav-hover);
          font-weight: 600;
        }
        /* 代码块 - 浅灰色背景 + 语法高亮 (比 Mermaid #ebebeb 稍深) */
        .markdown-content pre.hljs,
        .markdown-content pre {
          background: #dedede !important;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 0.75rem;
          overflow-x: auto;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        /* 暗色模式 - 使用深灰色而非纯黑 */
        @media (prefers-color-scheme: dark) {
          .markdown-content pre.hljs,
          .markdown-content pre {
            background: #2a2a2a !important;
          }
          .markdown-content pre code {
            color: #d4d4d4;
          }
        }
        :root.dark .markdown-content pre.hljs,
        :root.dark .markdown-content pre {
          background: #2a2a2a !important;
        }
        :root.dark .markdown-content pre code {
          color: #d4d4d4;
        }
        /* 行内代码 */
        .markdown-content code {
          background: var(--nav-hover);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
        }
        .markdown-content pre code {
          background: none;
          padding: 0;
          color: #1e1e1e;
        }
        /* highlight.js 语法高亮颜色 - 浅色背景适配 */
        .hljs-keyword { color: #a626a4; }
        .hljs-built_in { color: #0184bb; }
        .hljs-type { color: #0184bb; }
        .hljs-literal { color: #0184bb; }
        .hljs-number { color: #986801; }
        .hljs-string { color: #50a14f; }
        .hljs-comment { color: #a0a1a7; font-style: italic; }
        .hljs-doctag { color: #a0a1a7; }
        .hljs-meta { color: #4078f2; }
        .hljs-attr { color: #986801; }
        .hljs-attribute { color: #986801; }
        .hljs-name { color: #e45649; }
        .hljs-tag { color: #e45649; }
        .hljs-selector-tag { color: #e45649; }
        .hljs-selector-class { color: #986801; }
        .hljs-selector-id { color: #4078f2; }
        .hljs-variable { color: #e45649; }
        .hljs-template-variable { color: #e45649; }
        .hljs-function { color: #4078f2; }
        .hljs-title { color: #4078f2; }
        .hljs-params { color: #383a42; }
        .hljs-regexp { color: #50a14f; }
        .hljs-symbol { color: #0184bb; }
        .hljs-bullet { color: #4078f2; }
        .hljs-link { color: #0184bb; }
        .hljs-deletion { color: #e45649; background: rgba(228, 86, 73, 0.1); }
        .hljs-addition { color: #50a14f; background: rgba(80, 161, 79, 0.1); }
        /* 暗色模式语法高亮 */
        @media (prefers-color-scheme: dark) {
          .markdown-content pre code { color: #d4d4d4; }
          .hljs-keyword { color: #c586c0; }
          .hljs-built_in { color: #4ec9b0; }
          .hljs-type { color: #4ec9b0; }
          .hljs-literal { color: #569cd6; }
          .hljs-number { color: #b5cea8; }
          .hljs-string { color: #ce9178; }
          .hljs-comment { color: #6a9955; }
          .hljs-function { color: #dcdcaa; }
          .hljs-title { color: #dcdcaa; }
          .hljs-variable { color: #9cdcfe; }
          .hljs-name { color: #569cd6; }
          .hljs-tag { color: #569cd6; }
        }
        :root.dark .markdown-content pre code { color: #d4d4d4; }
        :root.dark .hljs-keyword { color: #c586c0; }
        :root.dark .hljs-built_in { color: #4ec9b0; }
        :root.dark .hljs-type { color: #4ec9b0; }
        :root.dark .hljs-literal { color: #569cd6; }
        :root.dark .hljs-number { color: #b5cea8; }
        :root.dark .hljs-string { color: #ce9178; }
        :root.dark .hljs-comment { color: #6a9955; }
        :root.dark .hljs-function { color: #dcdcaa; }
        :root.dark .hljs-title { color: #dcdcaa; }
        :root.dark .hljs-variable { color: #9cdcfe; }
        :root.dark .hljs-name { color: #569cd6; }
        :root.dark .hljs-tag { color: #569cd6; }
      `}</style>
    </div>
  );
}
