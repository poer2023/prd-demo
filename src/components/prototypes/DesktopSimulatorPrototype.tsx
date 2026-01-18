/**
 * 消息模拟器原型
 * Desktop 应用中模拟 Telegram 消息样式 - 浅色模式
 */

'use client';

import { useState } from 'react';

interface SimulatorMessage {
  text: string;
  buttons?: { text: string; data: string }[][];
  parseMode?: 'markdown' | 'html';
}

export function DesktopSimulatorPrototype() {
  const [message, setMessage] = useState<SimulatorMessage>({
    text: `**欢迎使用 C2ME Bot!** 🎉

我是你的 AI 编程助手。

__功能列表:__
• \`/createproject\` - 创建新项目
• \`/listproject\` - 查看项目列表
• \`/help\` - 获取帮助

直接发送消息开始对话！`,
    buttons: [
      [{ text: '📁 创建项目', data: 'create_project' }],
      [{ text: '📋 项目列表', data: 'list_project' }, { text: '❓ 帮助', data: 'help' }]
    ],
    parseMode: 'markdown'
  });

  const [inputText, setInputText] = useState(message.text);
  const [showJson, setShowJson] = useState(false);

  const handlePreview = () => {
    setMessage({ ...message, text: inputText });
  };

  const renderMarkdown = (text: string) => {
    // 简单的 Markdown 渲染
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/__(.*?)__/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-[#2AABEE] text-xs font-mono">$1</code>')
      .replace(/\n/g, '<br/>');
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
          C2ME Dashboard - 消息模拟器
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div className="w-1/2 border-r border-gray-200 p-4 flex flex-col bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-900">消息编辑器</div>
            <select
              value={message.parseMode}
              onChange={(e) => setMessage({ ...message, parseMode: e.target.value as 'markdown' | 'html' })}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 outline-none focus:border-[#2AABEE]"
            >
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
            </select>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 w-full p-4 border border-gray-200 rounded-xl font-mono text-sm resize-none bg-gray-50 text-gray-700 outline-none focus:border-[#2AABEE] placeholder-gray-400"
            placeholder="输入消息内容..."
          />

          <div className="mt-4 flex gap-2">
            <button
              onClick={handlePreview}
              className="flex-1 py-2.5 bg-[#2AABEE] text-white rounded-lg text-sm font-medium hover:bg-[#229ED9] transition-colors"
            >
              更新预览
            </button>
            <button
              onClick={() => setShowJson(!showJson)}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              {showJson ? '隐藏 JSON' : '查看 JSON'}
            </button>
          </div>

          {/* JSON View */}
          {showJson && (
            <div className="mt-4 bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-auto max-h-32">
              <pre>{JSON.stringify(message, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 p-4 flex flex-col bg-gray-50">
          <div className="text-sm font-medium text-gray-900 mb-3">Telegram 预览</div>

          {/* Telegram message preview in desktop context */}
          <div className="flex-1 bg-[#E5DDD5] rounded-2xl overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-[#2AABEE] px-3 py-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                C2
              </div>
              <div>
                <div className="text-white text-sm font-medium">C2ME Bot</div>
                <div className="text-white/70 text-[10px]">在线</div>
              </div>
            </div>

            {/* Message */}
            <div className="p-3 h-[calc(100%-52px)] overflow-y-auto">
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm p-3 max-w-[90%]">
                <div className="text-[10px] font-medium text-[#2AABEE] mb-1">C2ME Bot</div>
                <div
                  className="text-sm leading-relaxed text-gray-900"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }}
                />

                {/* Inline Keyboard */}
                {message.buttons && (
                  <div className="mt-3 space-y-1">
                    {message.buttons.map((row, i) => (
                      <div key={i} className="flex gap-1">
                        {row.map((btn, j) => (
                          <button
                            key={j}
                            className="flex-1 px-2 py-2 text-xs text-[#2AABEE] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {btn.text}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-[9px] text-gray-400 text-right mt-2">12:00</div>
              </div>
            </div>
          </div>

          {/* Theme toggle */}
          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-500">
            <span>主题预览:</span>
            <button className="px-3 py-1.5 bg-[#2AABEE] text-white border border-[#2AABEE] rounded-lg flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
              浅色
            </button>
            <button className="px-3 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              深色
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
