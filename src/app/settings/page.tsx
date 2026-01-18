"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import type { LLMProvider } from "@/lib/llm/types";

interface LLMSettings {
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

const DEFAULT_SETTINGS: LLMSettings = {
  provider: "openai",
  apiKey: "",
  baseUrl: "",
  model: "",
  maxTokens: 4096,
  temperature: 0.7,
};

const PROVIDER_OPTIONS: { value: LLMProvider; label: string; defaultModel: string; defaultUrl: string }[] = [
  { value: "claude", label: "Claude (Anthropic)", defaultModel: "claude-sonnet-4-20250514", defaultUrl: "https://api.anthropic.com" },
  { value: "openai", label: "OpenAI", defaultModel: "gpt-4o", defaultUrl: "https://api.openai.com" },
  { value: "openrouter", label: "OpenRouter", defaultModel: "anthropic/claude-sonnet-4", defaultUrl: "https://openrouter.ai/api" },
  { value: "custom", label: "Custom (OpenAI Compatible)", defaultModel: "", defaultUrl: "" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<LLMSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("llm-settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProviderChange = (provider: LLMProvider) => {
    const option = PROVIDER_OPTIONS.find(p => p.value === provider);
    setSettings(prev => ({
      ...prev,
      provider,
      model: option?.defaultModel || prev.model,
      baseUrl: option?.defaultUrl || prev.baseUrl,
    }));
    setSaved(false);
    setTestResult(null);
  };

  const handleSave = () => {
    localStorage.setItem("llm-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/llm/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Say hello in 5 words or less." }],
          config: {
            provider: settings.provider,
            apiKey: settings.apiKey,
            baseUrl: settings.baseUrl || undefined,
            model: settings.model,
            maxTokens: 50,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      setTestResult({
        success: true,
        message: `Success! Response: "${data.content}"`,
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header projectName="Settings" />

      <main className="max-w-2xl mx-auto py-8 px-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-6">LLM Settings</h1>

        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] p-6 space-y-6">
          {/* Provider Selection - 自定义下拉框 */}
          <div ref={dropdownRef}>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Provider
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-3 py-2.5 pr-10 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-left cursor-pointer"
              >
                {PROVIDER_OPTIONS.find(p => p.value === settings.provider)?.label}
              </button>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* 下拉菜单 - 显示在按钮下方 */}
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md shadow-lg z-50 overflow-hidden">
                  {PROVIDER_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        handleProviderChange(option.value);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left hover:bg-[var(--background)] transition-colors ${
                        settings.provider === option.value
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-[var(--foreground)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {settings.provider === option.value && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span className={settings.provider === option.value ? '' : 'ml-6'}>{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              API Key
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => {
                setSettings(prev => ({ ...prev, apiKey: e.target.value }));
                setSaved(false);
                setTestResult(null);
              }}
              placeholder="sk-..."
              className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Base URL - 所有 Provider 都显示 */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Base URL
              <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                {settings.provider !== "custom" ? "(可选，用于自定义端点)" : "(必填)"}
              </span>
            </label>
            <input
              type="url"
              value={settings.baseUrl}
              onChange={(e) => {
                setSettings(prev => ({ ...prev, baseUrl: e.target.value }));
                setSaved(false);
                setTestResult(null);
              }}
              placeholder={
                PROVIDER_OPTIONS.find(p => p.value === settings.provider)?.defaultUrl || "https://your-api-endpoint.com"
              }
              className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Model
            </label>
            <input
              type="text"
              value={settings.model}
              onChange={(e) => {
                setSettings(prev => ({ ...prev, model: e.target.value }));
                setSaved(false);
                setTestResult(null);
              }}
              placeholder="gpt-4o / claude-sonnet-4-20250514 / ..."
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Advanced Settings */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Advanced Settings
            </summary>
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-[var(--border-color)]">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 4096 }));
                    setSaved(false);
                  }}
                  min={1}
                  max={128000}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Temperature: {settings.temperature}
                </label>
                <input
                  type="range"
                  value={settings.temperature}
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }));
                    setSaved(false);
                  }}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </details>

          {/* Test Result */}
          {testResult && (
            <div className={`p-4 rounded-md ${testResult.success ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"}`}>
              {testResult.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="btn-primary flex-1"
            >
              {saved ? "✓ Saved" : "Save Settings"}
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !settings.apiKey || !settings.model}
              className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? "Testing..." : "Test Connection"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-sm text-[var(--muted-foreground)]">
          <p>Settings are stored locally in your browser. API keys are never sent to our servers.</p>
        </div>
      </main>
    </div>
  );
}
