/**
 * 文件浏览器原型
 * 展示通过 Telegram 键盘导航项目目录
 */

'use client';

import { useState } from 'react';

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  size?: string;
}

const mockFileSystem: Record<string, FileItem[]> = {
  '/': [
    { name: 'src', type: 'folder' },
    { name: 'tests', type: 'folder' },
    { name: 'package.json', type: 'file', size: '1.2KB' },
    { name: 'tsconfig.json', type: 'file', size: '0.8KB' },
    { name: 'README.md', type: 'file', size: '3.5KB' },
  ],
  '/src': [
    { name: 'handlers', type: 'folder' },
    { name: 'models', type: 'folder' },
    { name: 'storage', type: 'folder' },
    { name: 'utils', type: 'folder' },
    { name: 'main.ts', type: 'file', size: '2.5KB' },
    { name: 'config.ts', type: 'file', size: '1.2KB' },
  ],
  '/src/handlers': [
    { name: 'TelegramHandler.ts', type: 'file', size: '8.2KB' },
    { name: 'CommandHandler.ts', type: 'file', size: '4.5KB' },
    { name: 'MessageHandler.ts', type: 'file', size: '3.8KB' },
    { name: 'ToolHandler.ts', type: 'file', size: '5.1KB' },
  ],
  '/src/models': [
    { name: 'UserSession.ts', type: 'file', size: '2.1KB' },
    { name: 'Project.ts', type: 'file', size: '1.5KB' },
  ],
  '/src/storage': [
    { name: 'IStorage.ts', type: 'file', size: '1.8KB' },
    { name: 'RedisStorage.ts', type: 'file', size: '4.2KB' },
    { name: 'MemoryStorage.ts', type: 'file', size: '2.8KB' },
  ],
  '/src/utils': [
    { name: 'logger.ts', type: 'file', size: '0.9KB' },
    { name: 'helpers.ts', type: 'file', size: '1.3KB' },
  ],
  '/tests': [
    { name: 'handlers.test.ts', type: 'file', size: '3.2KB' },
    { name: 'storage.test.ts', type: 'file', size: '2.8KB' },
  ],
};

export function TelegramFileBrowserPrototype() {
  const [currentPath, setCurrentPath] = useState('/');
  const [history, setHistory] = useState<string[]>(['/']);

  const currentItems = mockFileSystem[currentPath] || [];
  const folders = currentItems.filter(item => item.type === 'folder');

  const handleNavigate = (item: FileItem) => {
    if (item.type === 'folder') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      if (mockFileSystem[newPath]) {
        setCurrentPath(newPath);
        setHistory([...history, newPath]);
      }
    }
  };

  const handleBack = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parentPath);
    setHistory([...history, parentPath]);
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return (
        <svg className="w-5 h-5 text-[#54a3ff]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      );
    }
    const ext = item.name.split('.').pop();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return (
          <svg className="w-5 h-5 text-[#3178c6]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h18v18H3V3zm10.71 13.5v-1.67c.31.24.66.43 1.02.55.37.13.74.19 1.11.19.26 0 .49-.03.68-.08.2-.06.35-.13.48-.23.12-.1.21-.22.27-.36.06-.13.09-.28.09-.44 0-.22-.05-.41-.16-.58-.1-.17-.25-.32-.43-.46-.18-.14-.39-.27-.63-.39-.24-.13-.49-.27-.76-.41-.4-.21-.75-.44-1.04-.67-.29-.24-.53-.49-.71-.77-.19-.28-.33-.58-.42-.9-.09-.33-.13-.68-.13-1.06 0-.52.1-.97.29-1.34.2-.37.46-.68.8-.93.34-.24.74-.43 1.19-.55.46-.12.95-.18 1.47-.18.28 0 .55.02.82.05.27.04.52.09.77.17.24.07.47.16.69.27.21.11.4.23.55.38l-.64 1.49c-.22-.17-.47-.3-.75-.41-.29-.11-.61-.17-.97-.17-.23 0-.43.02-.61.07-.18.05-.33.12-.46.21-.12.09-.22.2-.28.33-.07.13-.1.27-.1.43 0 .19.04.36.13.51.09.15.22.29.38.41.17.13.37.25.6.37.23.12.49.25.77.39.41.2.78.42 1.1.65.32.23.59.49.81.77.22.28.39.59.5.93.12.34.17.72.17 1.14 0 .55-.1 1.03-.29 1.42-.2.4-.47.73-.82 1-.35.26-.77.46-1.24.59-.48.13-1 .19-1.56.19-.34 0-.68-.03-1.01-.09-.33-.06-.64-.15-.93-.26-.29-.11-.55-.25-.79-.41-.23-.17-.42-.35-.57-.56zM14 11.25h-1.5v4.5H11v-4.5H9.5V10H14v1.25z"/>
          </svg>
        );
      case 'js':
        return (
          <svg className="w-5 h-5 text-[#f7df1e]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h18v18H3V3zm4.73 15.04c.4.85 1.19 1.55 2.54 1.55 1.5 0 2.53-.75 2.53-2.42v-5.17h-1.97v5.1c0 .8-.33 1.02-.83 1.02-.5 0-.73-.32-.96-.72l-1.31.64zm5.98-.18c.5.98 1.51 1.73 3.09 1.73 1.6 0 2.8-.83 2.8-2.36 0-1.41-.81-2.04-2.25-2.66l-.42-.18c-.73-.31-1.04-.52-1.04-1.02 0-.41.31-.73.81-.73.49 0 .8.21 1.09.73l1.31-.84c-.55-.98-1.32-1.35-2.4-1.35-1.5 0-2.47.96-2.47 2.23 0 1.38.81 2.03 2.03 2.55l.42.18c.78.34 1.24.55 1.24 1.13 0 .48-.45.83-1.15.83-.83 0-1.31-.43-1.67-1.03l-1.39.8z"/>
          </svg>
        );
      case 'json':
        return (
          <svg className="w-5 h-5 text-[#cbcb41]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3h2v2H5v5a2 2 0 01-2 2 2 2 0 012 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 00-2-2H0v-2h1a2 2 0 002-2V5a2 2 0 012-2m14 0a2 2 0 012 2v4a2 2 0 002 2h1v2h-1a2 2 0 00-2 2v4a2 2 0 01-2 2h-2v-2h2v-5a2 2 0 012-2 2 2 0 01-2-2V5h-2V3h2m-7 12a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1m-4 0a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1m8 0a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1z"/>
          </svg>
        );
      case 'md':
        return (
          <svg className="w-5 h-5 text-[#519aba]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12c.79 0 1.44.63 1.44 1.41v9.18c0 .78-.65 1.41-1.44 1.41M6.81 15.19v-3.66l1.92 2.35 1.92-2.35v3.66h1.93V8.81h-1.93l-1.92 2.35-1.92-2.35H4.89v6.38h1.92M19.69 12h-1.92V8.81h-1.92V12h-1.93l2.89 3.28L19.69 12z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
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
          <div className="text-white/70 text-xs">文件浏览器</div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* User Command */}
        <div className="flex justify-end mb-3">
          <div className="bg-[#EFFDDE] px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
            <div className="text-sm text-gray-900 font-mono">/ls</div>
            <div className="text-[10px] text-gray-400 text-right mt-1">12:30</div>
          </div>
        </div>

        {/* Bot Response */}
        <div className="flex justify-start">
          <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm p-4 max-w-[90%]">
            <div className="text-xs font-medium text-[#2AABEE] mb-3">C2ME Bot</div>

            {/* Path breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 font-mono bg-gray-100 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 text-[#54a3ff]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="text-gray-900">{currentPath}</span>
            </div>

            {/* File list */}
            <div className="space-y-1 mb-4">
              {currentItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => item.type === 'folder' && handleNavigate(item)}
                  className={`flex items-center justify-between text-sm py-2 px-3 rounded-lg transition-colors ${
                    item.type === 'folder'
                      ? 'hover:bg-gray-100 cursor-pointer'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(item)}
                    <span className={item.type === 'folder' ? 'text-[#2AABEE] font-medium' : 'text-gray-700'}>
                      {item.name}{item.type === 'folder' ? '/' : ''}
                    </span>
                  </div>
                  {item.size && (
                    <span className="text-xs text-gray-500">{item.size}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation buttons - Telegram Inline Keyboard Style */}
            <div className="space-y-1">
              {/* Folder buttons in grid */}
              {folders.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  {folders.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleNavigate(item)}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-[#2AABEE] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                      {item.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-1 mt-1">
                <button
                  onClick={handleBack}
                  disabled={currentPath === '/'}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    currentPath === '/'
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-[#2AABEE] bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回
                </button>
                <button
                  onClick={() => {}}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-[#2AABEE] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  刷新
                </button>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 text-right mt-3">12:30</div>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 bg-white text-xs text-gray-500 text-center border-t border-gray-200 flex-shrink-0">
        💡 点击文件夹进入，点击返回返回上级
      </div>
    </div>
  );
}
