/**
 * 命令系统原型
 * 展示 Telegram Bot 的命令交互界面
 */

'use client';

import { useState } from 'react';

// Telegram 风格的消息气泡
function ChatBubble({
  isBot,
  children,
  time = '12:00'
}: {
  isBot: boolean;
  children: React.ReactNode;
  time?: string;
}) {
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      <div
        className={`
          max-w-[85%] px-4 py-2.5 rounded-2xl relative
          ${isBot
            ? 'bg-white rounded-bl-sm shadow-sm'
            : 'bg-[#EFFDDE] rounded-br-sm'
          }
        `}
      >
        {isBot && (
          <div className="text-xs font-medium text-[#2AABEE] mb-1">
            C2ME Bot
          </div>
        )}
        <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
          {children}
        </div>
        <div className="text-[10px] text-gray-400 text-right mt-1">
          {time}
        </div>
      </div>
    </div>
  );
}

// 内联键盘按钮
function InlineKeyboard({ buttons, onPress }: {
  buttons: { text: string; data: string }[][];
  onPress?: (data: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 mt-3">
      {buttons.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((btn, j) => (
            <button
              key={j}
              onClick={() => onPress?.(btn.data)}
              className="flex-1 px-3 py-2 text-sm font-medium text-[#2AABEE] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {btn.text}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export function TelegramCommandsPrototype() {
  const [messages, setMessages] = useState([
    { id: 1, isBot: false, text: '/start', time: '10:30' },
    { id: 2, isBot: true, text: `👋 欢迎使用 C2ME Bot!

我是你的 AI 编程助手，集成了 Claude Code SDK。

🚀 快速开始:
• /createproject - 创建新项目
• /listproject - 查看项目列表
• /help - 查看所有命令

💡 直接发送消息即可与 Claude 对话`, time: '10:30', buttons: [
      [{ text: '📁 创建项目', data: 'create' }, { text: '📋 项目列表', data: 'list' }],
      [{ text: '❓ 帮助', data: 'help' }]
    ]},
  ]);

  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      isBot: false,
      text: inputValue,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInputValue('');

    // 模拟 Bot 响应
    setTimeout(() => {
      let response = { text: '收到你的消息，正在处理...', buttons: undefined as { text: string; data: string }[][] | undefined };

      if (inputValue.toLowerCase().includes('/help')) {
        response = {
          text: `📖 命令帮助

基础命令:
/start - 初始化会话
/help - 显示帮助
/status - 查看状态
/clear - 清除会话

项目管理:
/createproject - 创建项目
/listproject - 项目列表
/exitproject - 退出项目

Claude 功能:
/compact - 压缩对话
/undo - 撤销操作
/model - 切换模型`,
          buttons: undefined
        };
      } else if (inputValue.toLowerCase().includes('/status')) {
        response = {
          text: `📊 当前状态

👤 用户: User123
📁 项目: c2me-bot
🔐 权限: Accept Edits
💬 对话轮数: 12
🎯 模型: claude-sonnet-4-20250514`,
          buttons: [
            [{ text: '🔒 Default', data: 'perm_default' }, { text: '✏️ Edits', data: 'perm_edits' }],
            [{ text: '📋 Plan', data: 'perm_plan' }, { text: '⚡ Bypass', data: 'perm_bypass' }]
          ]
        };
      }

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        isBot: true,
        text: response.text,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        buttons: response.buttons
      }]);
    }, 500);
  };

  return (
    <div className="w-[375px] h-[667px] mx-auto bg-[#E5DDD5] rounded-[40px] overflow-hidden shadow-xl border-[8px] border-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-[#2AABEE] px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
          C2
        </div>
        <div className="flex-1">
          <div className="text-white font-medium">C2ME Bot</div>
          <div className="text-white/70 text-xs">在线</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            <ChatBubble isBot={msg.isBot} time={msg.time}>
              {msg.text}
              {(msg as { buttons?: { text: string; data: string }[][] }).buttons && (
                <InlineKeyboard buttons={(msg as { buttons: { text: string; data: string }[][] }).buttons} />
              )}
            </ChatBubble>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white px-3 py-2 flex items-center gap-2 border-t border-gray-200 flex-shrink-0">
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入命令或消息..."
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-1 focus:ring-[#2AABEE]"
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-full bg-[#2AABEE] flex items-center justify-center text-white hover:bg-[#229ED9] transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
