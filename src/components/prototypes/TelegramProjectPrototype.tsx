/**
 * 项目管理原型
 * 展示创建项目和项目列表的交互
 */

'use client';

import { useState } from 'react';

type ProjectType = 'github' | 'local';
type CreateStep = 'select' | 'input' | 'confirm' | 'done';

interface Project {
  id: string;
  name: string;
  type: ProjectType;
  path: string;
  lastAccess: string;
}

const mockProjects: Project[] = [
  { id: '1', name: 'c2me-bot', type: 'github', path: 'https://github.com/user/c2me-bot', lastAccess: '2 小时前' },
  { id: '2', name: 'prd-demo', type: 'local', path: '/Users/dev/projects/prd-demo', lastAccess: '1 天前' },
  { id: '3', name: 'my-app', type: 'github', path: 'https://github.com/user/my-app', lastAccess: '3 天前' },
];

export function TelegramProjectPrototype() {
  const [step, setStep] = useState<CreateStep>('select');
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [projects] = useState<Project[]>(mockProjects);
  const [view, setView] = useState<'create' | 'list'>('create');

  const handleSelectType = (type: ProjectType) => {
    setProjectType(type);
    setStep('input');
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    setStep('confirm');
  };

  const handleConfirm = () => {
    setStep('done');
    setTimeout(() => {
      setStep('select');
      setInputValue('');
      setProjectType(null);
    }, 2000);
  };

  const reset = () => {
    setStep('select');
    setInputValue('');
    setProjectType(null);
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
          <div className="text-white/70 text-xs">项目管理</div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={() => { setView('create'); reset(); }}
          className={`flex-1 py-3 text-sm font-medium transition ${
            view === 'create'
              ? 'text-[#2AABEE] border-b-2 border-[#2AABEE] bg-[#2AABEE]/5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          创建项目
        </button>
        <button
          onClick={() => setView('list')}
          className={`flex-1 py-3 text-sm font-medium transition ${
            view === 'list'
              ? 'text-[#2AABEE] border-b-2 border-[#2AABEE] bg-[#2AABEE]/5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          项目列表
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {view === 'create' ? (
          <>
            {/* Create Project Flow */}
            {step === 'select' && (
              <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-sm">
                <div className="text-xs font-medium text-[#2AABEE] mb-2">C2ME Bot</div>
                <div className="text-sm text-gray-900 mb-4">
                  📁 创建新项目
                  <br /><br />
                  <span className="text-gray-600">请选择项目类型：</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => handleSelectType('github')}
                    className="w-full p-4 text-left rounded-xl bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">GitHub 仓库</div>
                        <div className="text-xs text-gray-500">从 GitHub 克隆仓库</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSelectType('local')}
                    className="w-full p-4 text-left rounded-xl bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2AABEE]/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#2AABEE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">本地目录</div>
                        <div className="text-xs text-gray-500">使用服务器上的目录</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {step === 'input' && (
              <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-sm">
                <div className="text-xs font-medium text-[#2AABEE] mb-2">C2ME Bot</div>
                <div className="text-sm text-gray-900 mb-4">
                  {projectType === 'github' ? (
                    <>
                      <svg className="w-5 h-5 inline mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      请输入 GitHub 仓库 URL：
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 inline mr-2 text-[#2AABEE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      请输入本地目录路径：
                    </>
                  )}
                </div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={projectType === 'github' ? 'https://github.com/user/repo' : '/path/to/project'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 mb-4 outline-none focus:border-[#2AABEE]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={reset}
                    className="flex-1 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    确认
                  </button>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-sm">
                <div className="text-xs font-medium text-[#2AABEE] mb-2">C2ME Bot</div>
                <div className="text-sm text-gray-900 mb-4">
                  ✅ 确认创建项目？
                </div>
                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                  <div className="text-xs text-gray-500 mb-1">类型</div>
                  <div className="text-gray-900 flex items-center gap-2 mb-3">
                    {projectType === 'github' ? (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub 仓库
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-[#2AABEE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        本地目录
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">路径</div>
                  <div className="font-mono text-xs text-gray-700 break-all">{inputValue}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('input')}
                    className="flex-1 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    返回修改
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    确认创建
                  </button>
                </div>
              </div>
            )}

            {step === 'done' && (
              <div className="bg-white rounded-2xl rounded-bl-sm p-6 text-center shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="font-medium text-lg text-gray-900 mb-2">项目创建成功！</div>
                <div className="text-sm text-gray-500">
                  {projectType === 'github' ? '正在克隆仓库...' : '目录验证成功'}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Project List */
          <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-sm">
            <div className="text-xs font-medium text-[#2AABEE] mb-2">C2ME Bot</div>
            <div className="text-sm text-gray-900 mb-4">📋 你的项目列表：</div>
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  className="w-full p-4 text-left rounded-xl bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                      background: project.type === 'github' ? '#333' : 'rgba(42, 171, 238, 0.2)'
                    }}>
                      {project.type === 'github' ? (
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-[#2AABEE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{project.name}</div>
                      <div className="text-xs text-gray-500 truncate">{project.path}</div>
                    </div>
                    <div className="text-xs text-gray-500">{project.lastAccess}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
