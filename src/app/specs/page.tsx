"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { parseMarkdownSpec } from "@/lib/specs/parser";
import { saveSpec, getSpecList, deleteSpec, setActiveSpec, getActiveSpecId } from "@/lib/specs/store";
import type { DesignSpec, DesignSpecSummary } from "@/lib/specs/types";

export default function SpecsPage() {
  const [specs, setSpecs] = useState<DesignSpecSummary[]>([]);
  const [activeSpecId, setActiveSpecId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importContent, setImportContent] = useState("");
  const [importName, setImportName] = useState("");
  const [previewSpec, setPreviewSpec] = useState<DesignSpec | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSpecs = useCallback(() => {
    setSpecs(getSpecList());
    setActiveSpecId(getActiveSpecId());
  }, []);

  useEffect(() => {
    loadSpecs();
  }, [loadSpecs]);

  const handleParse = () => {
    setError(null);
    try {
      const spec = parseMarkdownSpec(importContent, importName || "Untitled Spec");
      setPreviewSpec(spec);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse error");
    }
  };

  const handleSave = () => {
    if (!previewSpec) return;
    saveSpec(previewSpec);
    setActiveSpec(previewSpec.id);
    setShowImport(false);
    setImportContent("");
    setImportName("");
    setPreviewSpec(null);
    loadSpecs();
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this spec?")) {
      deleteSpec(id);
      loadSpecs();
    }
  };

  const handleSetActive = (id: string) => {
    setActiveSpec(id);
    setActiveSpecId(id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportContent(content);
      setImportName(file.name.replace(/\.md$/, ""));
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header projectName="Design Specs" />

      <main className="max-w-4xl mx-auto py-8 px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">设计规范</h1>
          <button
            onClick={() => setShowImport(true)}
            className="btn-primary"
          >
            + 导入规范
          </button>
        </div>

        {/* Spec List */}
        {specs.length === 0 ? (
          <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] p-12 text-center">
            <div className="text-[var(--muted-foreground)] mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>还没有设计规范</p>
              <p className="text-sm mt-2">导入 Markdown 格式的设计规范文档</p>
            </div>
            <button
              onClick={() => setShowImport(true)}
              className="btn-secondary"
            >
              导入第一个规范
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {specs.map(spec => (
              <div
                key={spec.id}
                className={`bg-[var(--card-bg)] rounded-lg border p-4 ${
                  spec.id === activeSpecId
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-[var(--border-color)]"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[var(--foreground)]">{spec.name}</h3>
                      <span className="text-xs text-[var(--muted-foreground)]">v{spec.version}</span>
                      {spec.id === activeSpecId && (
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    {spec.description && (
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{spec.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-[var(--muted-foreground)]">
                      <span>{spec.tokenCount.colors} colors</span>
                      <span>{spec.tokenCount.typography} typography</span>
                      <span>{spec.tokenCount.components} components</span>
                      <span>{spec.tokenCount.patterns} patterns</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {spec.id !== activeSpecId && (
                      <button
                        onClick={() => handleSetActive(spec.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(spec.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Import Modal */}
        {showImport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--card-bg)] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                <h2 className="text-lg font-medium text-[var(--foreground)]">导入设计规范</h2>
                <button
                  onClick={() => {
                    setShowImport(false);
                    setImportContent("");
                    setImportName("");
                    setPreviewSpec(null);
                    setError(null);
                  }}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 flex-1 overflow-auto space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    规范名称
                  </label>
                  <input
                    type="text"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    placeholder="My Design System"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-[var(--foreground)]"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    上传 Markdown 文件
                  </label>
                  <input
                    type="file"
                    accept=".md,.markdown"
                    onChange={handleFileUpload}
                    className="w-full text-sm text-[var(--muted-foreground)]"
                  />
                </div>

                {/* Markdown Input */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    或粘贴 Markdown 内容
                  </label>
                  <textarea
                    value={importContent}
                    onChange={(e) => setImportContent(e.target.value)}
                    placeholder="# Design System\n\n## Colors\n\n| Name | Value |\n|------|-------|\n| primary | #3B82F6 |"
                    className="w-full h-48 px-3 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-[var(--foreground)] font-mono text-sm"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* Preview */}
                {previewSpec && (
                  <div className="border border-[var(--border-color)] rounded-md p-4 bg-[var(--background)]">
                    <h3 className="font-medium text-[var(--foreground)] mb-3">解析预览</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-[var(--muted-foreground)]">Colors</div>
                        <div className="font-medium text-[var(--foreground)]">{previewSpec.colors.length}</div>
                        {previewSpec.colors.slice(0, 3).map((c, i) => (
                          <div key={i} className="flex items-center gap-2 mt-1">
                            <span className="w-4 h-4 rounded" style={{ backgroundColor: c.value }} />
                            <span className="text-xs">{c.name}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="text-[var(--muted-foreground)]">Components</div>
                        <div className="font-medium text-[var(--foreground)]">{previewSpec.components.length}</div>
                        {previewSpec.components.slice(0, 3).map((c, i) => (
                          <div key={i} className="text-xs mt-1">{c.name}</div>
                        ))}
                      </div>
                      <div>
                        <div className="text-[var(--muted-foreground)]">Patterns</div>
                        <div className="font-medium text-[var(--foreground)]">{previewSpec.patterns.length}</div>
                        {previewSpec.patterns.slice(0, 3).map((p, i) => (
                          <div key={i} className="text-xs mt-1">{p.name}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[var(--border-color)] flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowImport(false);
                    setImportContent("");
                    setImportName("");
                    setPreviewSpec(null);
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
                {!previewSpec ? (
                  <button
                    onClick={handleParse}
                    disabled={!importContent.trim()}
                    className="btn-primary disabled:opacity-50"
                  >
                    解析
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="btn-primary"
                  >
                    保存规范
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
