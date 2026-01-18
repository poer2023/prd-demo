"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { marked, Renderer } from 'marked';
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "输入内容...",
  editable = true,
}: TiptapEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isInternalUpdate = useRef(false);
  const lastExternalContent = useRef(content);
  const editorRef = useRef<HTMLDivElement>(null);

  // 将 Markdown 转换为 HTML
  const htmlContent = useMemo(() => {
    if (!content) return '';

    let firstH1Skipped = false;

    // 自定义渲染器
    const renderer = new Renderer();

    // 自定义标题渲染器 - 跳过第一个 H1
    renderer.heading = function({ text, depth }: { text: string; depth: number }) {
      // 跳过第一个 H1 标题（页面顶部已有节点标题）
      if (depth === 1 && !firstH1Skipped) {
        firstH1Skipped = true;
        return ''; // 不渲染第一个 H1
      }
      return `<h${depth}>${text}</h${depth}>`;
    };

    // 代码块渲染
    renderer.code = function({ text, lang }: { text: string; lang?: string }) {
      const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre><code class="language-${lang || ''}">${escaped}</code></pre>`;
    };

    marked.setOptions({
      gfm: true,
      breaks: true,
    });
    marked.use({ renderer });

    return marked.parse(content) as string;
  }, [content]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'code-block',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: htmlContent, // 传入解析后的 HTML
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // 标记为内部更新，避免循环
      isInternalUpdate.current = true;
      onChange(editor.getHTML());
      // 在下一个事件循环中重置标记
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[60px]',
      },
    },
  });

  // 当外部 content 变化时更新编辑器（仅当不是内部更新时）
  useEffect(() => {
    if (editor && !isInternalUpdate.current && content !== lastExternalContent.current) {
      lastExternalContent.current = content;
      // 只有在编辑器没有焦点时才更新内容
      if (!editor.isFocused) {
        editor.commands.setContent(htmlContent, { emitUpdate: false });
      }
    }
  }, [content, htmlContent, editor]);

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleHeading = useCallback((level: 1 | 2 | 3 | 4) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const toggleTaskList = useCallback(() => {
    editor?.chain().focus().toggleTaskList().run();
  }, [editor]);

  const toggleCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run();
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  if (!editor) {
    return <div className="animate-pulse h-16 bg-[var(--nav-hover)] rounded-lg" />;
  }

  return (
    <div className="tiptap-wrapper group relative">
      {/* 浮动工具栏 - 聚焦时显示 */}
      {isFocused && (
        <div className="absolute -top-10 left-0 z-10 flex items-center gap-0.5 bg-[var(--background)] border border-[var(--border-color)] rounded-lg shadow-lg p-1">
          <ToolbarButton
            onClick={toggleBold}
            isActive={editor.isActive('bold')}
            title="粗体 (Cmd+B)"
          >
            <span className="font-bold text-xs">B</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={toggleItalic}
            isActive={editor.isActive('italic')}
            title="斜体 (Cmd+I)"
          >
            <span className="italic text-xs">I</span>
          </ToolbarButton>
          <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
          <ToolbarButton
            onClick={() => toggleHeading(1)}
            isActive={editor.isActive('heading', { level: 1 })}
            title="标题1"
          >
            <span className="text-xs">H1</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => toggleHeading(2)}
            isActive={editor.isActive('heading', { level: 2 })}
            title="标题2"
          >
            <span className="text-xs">H2</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => toggleHeading(3)}
            isActive={editor.isActive('heading', { level: 3 })}
            title="标题3"
          >
            <span className="text-xs">H3</span>
          </ToolbarButton>
          <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
          <ToolbarButton
            onClick={toggleBulletList}
            isActive={editor.isActive('bulletList')}
            title="无序列表"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={toggleOrderedList}
            isActive={editor.isActive('orderedList')}
            title="有序列表"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={toggleTaskList}
            isActive={editor.isActive('taskList')}
            title="任务列表"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </ToolbarButton>
          <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
          <ToolbarButton
            onClick={toggleCodeBlock}
            isActive={editor.isActive('codeBlock')}
            title="代码块"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={toggleBlockquote}
            isActive={editor.isActive('blockquote')}
            title="引用"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </ToolbarButton>
        </div>
      )}

      {/* 编辑器内容 */}
      <EditorContent editor={editor} className="tiptap-content" />

      {/* 样式 */}
      <style jsx global>{`
        .tiptap-content .ProseMirror {
          outline: none;
        }
        .tiptap-content .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-muted);
          pointer-events: none;
          height: 0;
        }
        .tiptap-content .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.2;
          color: var(--foreground);
        }
        .tiptap-content .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
          color: var(--foreground);
        }
        .tiptap-content .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.375rem;
          line-height: 1.4;
          color: var(--foreground);
        }
        .tiptap-content .ProseMirror h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 0.875rem;
          margin-bottom: 0.25rem;
          line-height: 1.4;
          color: var(--foreground);
        }
        .tiptap-content .ProseMirror p {
          margin-bottom: 0.5rem;
          line-height: 1.7;
          color: var(--foreground);
        }
        .tiptap-content .ProseMirror ul,
        .tiptap-content .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .tiptap-content .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        .tiptap-content .ProseMirror li p {
          margin-bottom: 0;
        }
        .tiptap-content .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }
        .tiptap-content .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .tiptap-content .ProseMirror ul[data-type="taskList"] li > label {
          flex-shrink: 0;
          margin-top: 0.25rem;
        }
        .tiptap-content .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1;
        }
        .tiptap-content .ProseMirror blockquote {
          border-left: 4px solid var(--border-color);
          padding-left: 1rem;
          margin-left: 0;
          margin-bottom: 0.5rem;
          color: var(--text-muted);
          font-style: italic;
        }
        .tiptap-content .ProseMirror code {
          background: var(--nav-hover);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
          color: #e83e8c;
        }
        .tiptap-content .ProseMirror pre {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 0.75rem;
          overflow-x: auto;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        .tiptap-content .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
          font-size: inherit;
        }
        .tiptap-content .ProseMirror hr {
          border: none;
          border-top: 2px solid var(--border-color);
          margin: 1.5rem 0;
        }
        .tiptap-content .ProseMirror strong {
          font-weight: 600;
        }
        .tiptap-content .ProseMirror em {
          font-style: italic;
        }
        /* 表格样式 */
        .tiptap-content .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        .tiptap-content .ProseMirror th,
        .tiptap-content .ProseMirror td {
          border: 1px solid var(--border-color);
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .tiptap-content .ProseMirror th {
          background: var(--nav-hover);
          font-weight: 600;
        }
        .tiptap-content .ProseMirror tr:nth-child(even) td {
          background: var(--nav-hover);
        }
      `}</style>
    </div>
  );
}

// 工具栏按钮组件
function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded transition ${
        isActive
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
          : 'text-[var(--foreground)] hover:bg-[var(--nav-hover)]'
      }`}
    >
      {children}
    </button>
  );
}
