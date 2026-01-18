/**
 * 消息处理原型
 * 展示各种消息类型的处理
 */

'use client';

import { useState } from 'react';

interface Message {
  id: number;
  isBot: boolean;
  type: 'text' | 'image' | 'file' | 'code';
  content: string;
  time: string;
  extra?: {
    filename?: string;
    filesize?: string;
    language?: string;
  };
}

export function TelegramMessagesPrototype() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, isBot: false, type: 'text', content: '@src/main.ts 解释这个文件的作用', time: '14:20' },
    { id: 2, isBot: true, type: 'text', content: `📄 正在读取 src/main.ts...

这是项目的主入口文件，主要功能：

1. **初始化 Telegram Bot** - 创建 Telegraf 实例
2. **注册处理器** - 命令、消息、回调
3. **启动轮询** - 开始监听 Telegram 消息
4. **优雅关闭** - 处理进程信号`, time: '14:20' },
    { id: 3, isBot: false, type: 'text', content: '!ls -la src/', time: '14:22' },
    { id: 4, isBot: true, type: 'code', content: `total 48
drwxr-xr-x  8 user  staff   256 Jan 15 10:30 .
drwxr-xr-x 12 user  staff   384 Jan 15 10:30 ..
drwxr-xr-x  6 user  staff   192 Jan 15 10:30 handlers
drwxr-xr-x  4 user  staff   128 Jan 15 10:30 models
drwxr-xr-x  4 user  staff   128 Jan 15 10:30 storage
drwxr-xr-x  3 user  staff    96 Jan 15 10:30 utils
-rw-r--r--  1 user  staff  2548 Jan 15 10:30 main.ts
-rw-r--r--  1 user  staff  1234 Jan 15 10:30 config.ts`, time: '14:22', extra: { language: 'bash' } },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMsg: Message = {
      id: messages.length + 1,
      isBot: false,
      type: 'text',
      content: inputValue,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInputValue('');

    // 模拟响应
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        isBot: true,
        type: 'text',
        content: '收到你的消息，正在处理中... 🤔',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 500);
  };

  const handleImageUpload = () => {
    setShowImageUpload(false);
    const newMsg: Message = {
      id: messages.length + 1,
      isBot: false,
      type: 'image',
      content: '📷 [图片]',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMsg]);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        isBot: true,
        type: 'text',
        content: `🖼️ 正在分析图片...

我看到这是一个代码截图，内容是一个 TypeScript 函数。

这个函数实现了：
• 参数验证
• 异步数据处理
• 错误处理

需要我详细解释吗？`,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <div className="w-[375px] h-[667px] mx-auto bg-[#E5DDD5] rounded-[40px] overflow-hidden shadow-xl border-[8px] border-gray-800 flex flex-col relative">
      {/* Header */}
      <div className="bg-[#2AABEE] px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
          C2
        </div>
        <div className="flex-1">
          <div className="text-white font-medium">C2ME Bot</div>
          <div className="text-white/70 text-xs">消息处理</div>
        </div>
      </div>

      {/* Syntax hints */}
      <div className="px-4 py-2 bg-white text-xs flex gap-4 overflow-x-auto border-b border-gray-200 flex-shrink-0">
        <span className="text-[#2AABEE] whitespace-nowrap flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2AABEE]"></span>
          @file - 引用文件
        </span>
        <span className="text-purple-500 whitespace-nowrap flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          !cmd - 执行命令
        </span>
        <span className="text-green-500 whitespace-nowrap flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          📷 支持图片
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`
                max-w-[85%] px-4 py-2.5 rounded-2xl
                ${msg.isBot
                  ? 'bg-white rounded-bl-sm shadow-sm'
                  : 'bg-[#EFFDDE] rounded-br-sm'
                }
              `}
            >
              {msg.isBot && (
                <div className="text-xs font-medium text-[#2AABEE] mb-1">C2ME Bot</div>
              )}

              {msg.type === 'code' ? (
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-gray-200 border-b border-gray-300">
                    <span className="text-xs text-gray-600">Terminal</span>
                    <button className="text-xs text-gray-500 hover:text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <pre className="px-3 py-2 text-xs text-gray-700 overflow-x-auto font-mono">
                    {msg.content}
                  </pre>
                </div>
              ) : msg.type === 'image' ? (
                <div className="w-40 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-10 h-10 mx-auto text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-500">已发送图片</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              )}

              <div className="text-[10px] text-gray-400 text-right mt-1">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Image upload modal */}
      {showImageUpload && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 m-4 max-w-xs shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#2AABEE]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#2AABEE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="font-medium text-gray-900">上传图片</div>
              <div className="text-sm text-gray-500">发送图片给 Claude 分析</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImageUpload(false)}
                className="flex-1 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={handleImageUpload}
                className="flex-1 py-2.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-lg text-sm font-medium"
              >
                模拟上传
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white px-3 py-2 flex items-center gap-2 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={() => setShowImageUpload(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入消息..."
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
