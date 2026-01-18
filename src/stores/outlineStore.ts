/**
 * 大纲状态管理
 * 使用 Zustand 进行状态管理
 */

import { create } from 'zustand';
import type {
  OutlineNode,
  OutlineState,
  ViewMode,
  CreateNodeParams,
  UpdateNodeParams,
  MoveNodeParams,
  ContentBlock,
} from '@/lib/outline/types';

// 生成唯一 ID
const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 初始示例数据 - C2ME 项目 PRD
const createInitialData = (): { nodes: Record<string, OutlineNode>; rootIds: string[] } => {
  const now = new Date().toISOString();

  const nodes: Record<string, OutlineNode> = {
    // ===== 项目概述 =====
    'node_overview': {
      id: 'node_overview',
      title: 'C2ME 项目概述',
      level: 0,
      order: 0,
      parentId: null,
      flowType: 'subprocess',
      contentBlocks: [
        { type: 'markdown', id: 'block_overview_1', content: `# C2ME - Claude Code Telegram Bot

## 项目简介

C2ME (Claude to Me) 是一个 Telegram Bot，集成 Claude Code SDK，提供 AI 编程助手功能。使用 Telegram 轮询模式，可在任何有互联网连接的计算机上运行，无需公网 IP 或域名。

## 核心价值

- **随时随地编程**: 通过 Telegram 与 Claude Code 交互，无需打开电脑
- **项目管理**: 支持 GitHub 仓库和本地目录
- **权限控制**: 灵活的工具使用审批机制
- **桌面管理**: Tauri 桌面应用实时监控
- **移动优先**: 专为 Telegram 使用场景优化的移动体验

## 技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 语言 | TypeScript | 5.8.3 | 严格模式 |
| 运行时 | Node.js | ES2022 | Via tsx |
| Bot 框架 | Telegraf | 4.16.3 | Telegram Bot |
| AI SDK | Claude Agent SDK | 0.1.76 | Claude Code 集成 |
| 队列 | BullMQ | 5.66.5 | 任务处理 |
| 缓存 | Redis | 5.6.1 | 会话存储 |
| HTTP | Express | 4.21.2 | 指标服务 |
| 桌面 | Tauri + React | - | 管理应用 |
| 测试 | Vitest | 3.0.0 | 单元测试 |

## 系统架构

\`\`\`mermaid
graph TB
    subgraph Telegram["Telegram Layer"]
        TG[Telegram API]
        Bot[Telegraf Bot]
    end

    subgraph Handlers["Handler Layer"]
        TH[TelegramHandler]
        CH[ClaudeManager]
        CMD[CommandHandler]
        CB[CallbackHandler]
        MSG[MessageHandler]
        TOOL[ToolHandler]
    end

    subgraph Services["Service Layer"]
        PERM[PermissionManager]
        SM[StreamManager]
        PM[ProgressManager]
    end

    subgraph Storage["Storage Layer"]
        IF[IStorage Interface]
        REDIS[(Redis)]
        MEM[(Memory)]
    end

    TG --> Bot
    Bot --> TH
    TH --> CMD
    TH --> CB
    TH --> MSG
    TH --> TOOL
    CH --> TH
    CH --> PERM
    CH --> SM
    TH --> IF
    IF --> REDIS
    IF -.-> MEM
\`\`\`` },
        { type: 'acceptance', id: 'block_overview_2', criteria: [
          { id: 'ac_ov_1', description: '核心 Telegram Bot 功能完成', completed: true },
          { id: 'ac_ov_2', description: 'Claude Code SDK 集成', completed: true },
          { id: 'ac_ov_3', description: 'Tauri 桌面应用完成', completed: true },
          { id: 'ac_ov_4', description: '消息批处理队列 (MessageBatcher)', completed: true },
          { id: 'ac_ov_5', description: '用户分析功能 (DAU/WAU/MAU)', completed: true },
        ]},
      ],
      childIds: ['node_telegram', 'node_desktop', 'node_workers'],
      createdAt: now,
      updatedAt: now,
    },

    // ===== Telegram Bot 模块 =====
    'node_telegram': {
      id: 'node_telegram',
      title: 'Telegram Bot',
      level: 1,
      order: 0,
      parentId: 'node_overview',
      flowType: 'subprocess',
      contentBlocks: [
        { type: 'markdown', id: 'block_tg_1', content: `# Telegram Bot 功能模块

## 模块概述

Telegram Bot 是用户与 Claude Code 交互的主要入口，支持文本消息、图片、文件等多种输入方式。专为移动端优化，提供自然的权限控制和可视化差异显示。

## 核心特性

- **自然权限控制**: 通过直观的内联键盘批准或拒绝工具操作
- **可视化差异显示**: 所有代码编辑操作显示全面的 diff 视图
- **集成文件浏览器**: 直接在 Telegram 内探索项目目录
- **基本操作支持**: /clear, /abort, /plan 等快捷命令

## 架构设计

\`\`\`mermaid
graph TD
    A[TelegramHandler<br/>主协调器] --> B[CommandHandler<br/>命令处理]
    A --> C[MessageHandler<br/>消息处理]
    A --> D[CallbackHandler<br/>按钮回调]
    A --> E[ToolHandler<br/>工具审批]
    A --> F[FileBrowserHandler<br/>文件浏览]
    A --> G[ProjectHandler<br/>项目管理]
    A --> H[ProgressControlHandler<br/>进度控制]
    A --> I[KeyboardFactory<br/>键盘生成]
\`\`\`

## 消息流架构

\`\`\`mermaid
sequenceDiagram
    participant U as 用户
    participant TG as Telegram
    participant TH as TelegramHandler
    participant CM as ClaudeManager
    participant SDK as Claude SDK
    participant ST as Storage

    U->>TG: 发送消息
    TG->>TH: Forward message
    TH->>ST: Get user session
    TH->>CM: addMessageToStream()
    CM->>SDK: query()

    loop Streaming Response
        SDK-->>CM: Message chunk
        CM-->>TH: onClaudeResponse callback
        TH-->>TG: Send to user
    end

    TH->>ST: Update session
\`\`\`` },
      ],
      childIds: ['node_commands', 'node_messages', 'node_permissions', 'node_project', 'node_filebrowser'],
      createdAt: now,
      updatedAt: now,
    },

    // 命令系统
    'node_commands': {
      id: 'node_commands',
      title: '命令系统',
      level: 2,
      order: 0,
      parentId: 'node_telegram',
      flowType: 'action',
      contentBlocks: [
        { type: 'markdown', id: 'block_cmd_1', content: `# 命令系统

## 基础命令

| 命令 | 功能 | 说明 |
|------|------|------|
| /start | 初始化会话 | 创建用户会话，显示欢迎信息 |
| /help | 帮助信息 | 显示所有可用命令 |
| /status | 会话状态 | 显示当前项目和权限模式 |
| /clear | 清除会话 | 重置对话历史 |

## 项目管理命令

| 命令 | 功能 |
|------|------|
| /createproject | 创建新项目（GitHub/本地目录） |
| /listproject | 列出所有项目 |
| /exitproject | 退出当前项目 |

## Claude Code 功能命令

| 命令 | 功能 |
|------|------|
| /compact | 压缩对话历史，节省 token |
| /undo | 撤销上一轮对话 |
| /model | 切换 Claude 模型 |
| /init | 创建 CLAUDE.md 项目配置 |
| /review | 代码审查快捷命令 |` },
        { type: 'interaction', id: 'block_cmd_2', rules: [
          { id: 'rule_cmd_1', trigger: '用户发送 /start', response: '创建会话，返回欢迎信息和功能介绍' },
          { id: 'rule_cmd_2', trigger: '用户发送 /createproject', response: '显示项目类型选择键盘（GitHub/本地目录）' },
          { id: 'rule_cmd_3', trigger: '用户发送 /compact', response: '压缩当前对话，显示节省的 token 数量' },
        ]},
        { type: 'acceptance', id: 'block_cmd_3', criteria: [
          { id: 'ac_cmd_1', description: '所有命令响应时间 < 500ms', completed: true },
          { id: 'ac_cmd_2', description: '命令错误时返回友好提示', completed: true },
          { id: 'ac_cmd_3', description: '支持命令自动补全', completed: false },
        ]}
      ],
      childIds: [],
      createdAt: now,
      updatedAt: now,
    },

    // 消息处理
    'node_messages': {
      id: 'node_messages',
      title: '消息处理',
      level: 2,
      order: 1,
      parentId: 'node_telegram',
      flowType: 'action',
      contentBlocks: [
        { type: 'markdown', id: 'block_msg_1', content: `# 消息处理

## 支持的消息类型

### 文本消息
- 普通文本：直接发送给 Claude
- @file 语法：引用项目文件添加到上下文
- !command 语法：快速执行 bash 命令

### 图片消息
- 支持发送图片给 Claude 进行分析
- 自动转换为 base64 格式
- 支持多图片批量发送

### 文件消息
- 支持 .txt, .py, .ts, .js, .md 等文本文件
- 自动读取文件内容添加到上下文
- 文件大小限制：10MB

## 消息队列

使用 BullMQ 实现消息队列：
- **优先级队列**: 3 级优先级（高/中/低）
- **消息去重**: xxhash + LRU Cache
- **批处理**: MessageBatcher 合并消息
- **重试机制**: 指数退避重试` },
        { type: 'interaction', id: 'block_msg_2', rules: [
          { id: 'rule_msg_1', trigger: '用户发送 "@src/main.ts 解释这个文件"', response: '读取文件内容，添加到上下文后发送给 Claude' },
          { id: 'rule_msg_2', trigger: '用户发送 "!ls -la"', response: '执行 bash 命令并返回结果' },
          { id: 'rule_msg_3', trigger: '用户发送图片', response: '转换为 base64，发送给 Claude 进行视觉分析' },
        ]},
        { type: 'acceptance', id: 'block_msg_3', criteria: [
          { id: 'ac_msg_1', description: '消息处理延迟 < 200ms', completed: true },
          { id: 'ac_msg_2', description: '图片支持 JPG/PNG/WebP 格式', completed: true },
          { id: 'ac_msg_3', description: '文件上传显示进度条', completed: false },
        ]}
      ],
      childIds: [],
      createdAt: now,
      updatedAt: now,
    },

    // 权限系统
    'node_permissions': {
      id: 'node_permissions',
      title: '权限系统',
      level: 2,
      order: 2,
      parentId: 'node_telegram',
      flowType: 'decision',
      contentBlocks: [
        { type: 'markdown', id: 'block_perm_1', content: `# 权限系统

## 权限模式

| 模式 | 命令 | 说明 |
|------|------|------|
| Default | /default | 所有工具需要审批 |
| Accept Edits | /acceptedits | 自动批准编辑操作 |
| Plan | /plan | 仅规划模式，不执行 |
| Bypass | /bypass | 自动批准所有操作 |

## 工具审批流程

\`\`\`mermaid
graph TD
    A[Claude 请求使用工具] --> B{检查权限模式}
    B -->|Bypass| C[自动批准]
    B -->|Accept Edits| D{是编辑操作?}
    D -->|是| C
    D -->|否| E[请求用户审批]
    B -->|Default| E
    E --> F{用户选择}
    F -->|批准| G[执行工具]
    F -->|拒绝| H[返回拒绝信息]
    F -->|批准全部| I[切换到 Bypass 模式]
\`\`\`

## 常驻快捷按钮

每条消息下方显示权限快捷切换按钮：
- 🔒 Default
- ✏️ Accept Edits
- 📋 Plan
- ⚡ Bypass` },
        { type: 'interaction', id: 'block_perm_2', rules: [
          { id: 'rule_perm_1', trigger: 'Claude 请求执行 Bash 命令', response: '发送审批请求，显示命令内容和批准/拒绝按钮' },
          { id: 'rule_perm_2', trigger: '用户点击"批准"按钮', response: '执行工具，返回结果' },
          { id: 'rule_perm_3', trigger: '用户点击权限模式切换按钮', response: '切换权限模式，更新按钮状态' },
        ]},
        { type: 'acceptance', id: 'block_perm_3', criteria: [
          { id: 'ac_perm_1', description: '权限请求清晰显示工具类型和参数', completed: true },
          { id: 'ac_perm_2', description: '超时未响应自动拒绝（60秒）', completed: true },
          { id: 'ac_perm_3', description: '支持批量审批相同类型操作', completed: false },
        ]}
      ],
      childIds: [],
      createdAt: now,
      updatedAt: now,
    },

    // ===== Desktop 应用 =====
    'node_desktop': {
      id: 'node_desktop',
      title: 'Desktop 管理应用',
      level: 1,
      order: 1,
      parentId: 'node_overview',
      flowType: 'subprocess',
      contentBlocks: [
        { type: 'markdown', id: 'block_desktop_1', content: `# Desktop 管理应用

## 技术架构

- **前端**: React + TypeScript
- **后端**: Tauri (Rust)
- **样式**: Tailwind CSS
- **国际化**: i18n (中/英)

## 功能模块

### 实时监控
- 服务状态指示
- 消息处理统计
- API 调用次数

### 日志查看
- 实时日志流
- 级别过滤（Debug/Info/Warn/Error）
- 全文搜索

### 用户管理
- 活跃用户列表
- DAU/WAU/MAU 统计
- 命令使用分析

### 系统设置
- 主题切换（亮/暗）
- 语言切换
- 开机自启动` },
      ],
      childIds: ['node_metrics', 'node_simulator'],
      createdAt: now,
      updatedAt: now,
    },

    // 指标面板
    'node_metrics': {
      id: 'node_metrics',
      title: '指标面板',
      level: 2,
      order: 0,
      parentId: 'node_desktop',
      flowType: 'page',
      contentBlocks: [
        { type: 'markdown', id: 'block_metrics_1', content: `# 指标面板

## 实时指标

### 消息统计
- 今日消息数
- 平均响应时间
- 成功/失败率

### API 调用
- Claude API 调用次数
- Token 使用量
- 错误率

### 系统资源
- CPU 使用率
- 内存占用
- 网络流量

## 数据可视化

使用 Recharts 绘制:
- 折线图：趋势变化
- 柱状图：对比分析
- 饼图：占比分布` },
        { type: 'acceptance', id: 'block_metrics_2', criteria: [
          { id: 'ac_metrics_1', description: '指标每秒自动刷新', completed: true },
          { id: 'ac_metrics_2', description: '支持时间范围筛选', completed: false },
          { id: 'ac_metrics_3', description: '异常指标高亮显示', completed: true },
        ]}
      ],
      childIds: [],
      createdAt: now,
      updatedAt: now,
    },

    // 消息模拟器
    'node_simulator': {
      id: 'node_simulator',
      title: '消息模拟器',
      level: 2,
      order: 1,
      parentId: 'node_desktop',
      flowType: 'page',
      contentBlocks: [
        { type: 'markdown', id: 'block_sim_1', content: `# 消息模拟器

## 功能介绍

Telegram 风格的消息查看器，用于预览和调试消息格式。

## 核心功能

### 消息预览
- 完全模拟 Telegram 消息样式
- 支持 Markdown 渲染
- 代码高亮显示

### 交互按钮
- 模拟 Inline Keyboard
- 按钮点击反馈
- 回调数据显示

### 调试功能
- 原始 JSON 查看
- 消息结构分析
- 格式化输出` },
        { type: 'interaction', id: 'block_sim_2', rules: [
          { id: 'rule_sim_1', trigger: '输入消息内容', response: '实时渲染 Telegram 样式预览' },
          { id: 'rule_sim_2', trigger: '点击模拟按钮', response: '显示按钮回调数据' },
        ]},
        { type: 'acceptance', id: 'block_sim_3', criteria: [
          { id: 'ac_sim_1', description: '消息样式与 Telegram 一致', completed: true },
          { id: 'ac_sim_2', description: '支持深色/浅色主题', completed: true },
          { id: 'ac_sim_3', description: '可导出消息为图片', completed: false },
        ]}
      ],
      childIds: [],
      createdAt: now,
      updatedAt: now,
    },

    // ===== Cloudflare Workers =====
    'node_workers': {
      id: 'node_workers',
      title: 'Cloudflare Workers',
      level: 1,
      order: 3,
      parentId: 'node_overview',
      flowType: 'subprocess',
      contentBlocks: [
        { type: 'markdown', id: 'block_workers_1', content: `# Cloudflare Workers (可选)

## 功能介绍

可选的 Cloudflare Workers 集成，提供差异查看和文件托管服务。

## 服务端点

| 端点 | 功能 |
|------|------|
| /api/diff | 差异内容查看服务 |
| /api/file | 文件查看服务 |
| /diff | HTML 差异渲染界面 |
| /file | HTML 文件渲染界面 |

## 配置

### 环境变量

\`\`\`env
WORKERS_ENABLED=true
WORKERS_ENDPOINT=your_workers_endpoint
WORKERS_API_KEY=your_secure_api_key_here
\`\`\`

### KV 绑定

需要在 Cloudflare Dashboard 创建 KV 命名空间（名称：CHATCODE）

## 部署

\`\`\`bash
cd workers
pnpm install
wrangler deploy
\`\`\`` },
        { type: 'acceptance', id: 'block_workers_2', criteria: [
          { id: 'ac_wk_1', description: 'Diff 查看服务', completed: true },
          { id: 'ac_wk_2', description: '文件查看服务', completed: true },
          { id: 'ac_wk_3', description: 'API Key 认证', completed: true },
        ]},
      ],
      childIds: [],
      createdAt: now,
      updatedAt: now,
    },

    // ===== 项目管理 =====
    'node_project': {
      id: 'node_project',
      title: '项目管理',
      level: 2,
      order: 3,
      parentId: 'node_telegram',
      flowType: 'action',
      contentBlocks: [
        { type: 'markdown', id: 'block_proj_1', content: `# 项目管理

## 功能概述

支持两种项目类型的创建和管理：
- **GitHub 仓库**: 自动克隆到工作目录
- **本地目录**: 直接使用服务器上的目录

## 项目流程

\`\`\`mermaid
graph TD
    A[createproject 命令] --> B{选择项目类型}
    B -->|GitHub| C[输入仓库 URL]
    B -->|本地目录| D[浏览目录]
    C --> E[克隆仓库]
    D --> F[验证目录]
    E --> G[创建项目记录]
    F --> G
    G --> H[进入项目会话]
\`\`\`

## 命令

| 命令 | 功能 |
|------|------|
| /createproject | 创建新项目 |
| /listproject | 列出所有项目 |
| /exitproject | 退出当前项目 |

## 数据模型

\`\`\`typescript
interface Project {
  id: string;
  userId: number;
  name: string;
  type: 'github' | 'local';
  path: string;
  repoUrl?: string;
  createdAt: string;
  lastAccessedAt: string;
}
\`\`\`` },
        { type: 'interaction', id: 'block_proj_2', rules: [
          { id: 'rule_proj_1', trigger: '用户发送 /createproject', response: '显示项目类型选择键盘（GitHub/本地目录）' },
          { id: 'rule_proj_2', trigger: '用户选择 GitHub', response: '提示输入仓库 URL' },
          { id: 'rule_proj_3', trigger: '用户选择本地目录', response: '显示文件浏览器' },
        ]},
        { type: 'acceptance', id: 'block_proj_3', criteria: [
          { id: 'ac_proj_1', description: 'GitHub 仓库克隆成功', completed: true },
          { id: 'ac_proj_2', description: '本地目录验证成功', completed: true },
          { id: 'ac_proj_3', description: '项目列表正确显示', completed: true },
        ]},
      ],
      childIds: [],
      createdAt: now,
      updatedAt: now,
    },

    // ===== 文件浏览器 =====
    'node_filebrowser': {
      id: 'node_filebrowser',
      title: '文件浏览器',
      level: 2,
      order: 4,
      parentId: 'node_telegram',
      flowType: 'page',
      contentBlocks: [
        { type: 'markdown', id: 'block_fb_1', content: `# 文件浏览器

## 功能概述

内置文件浏览器，支持通过 Telegram 键盘导航项目目录结构。

## 交互方式

- 使用内联键盘显示目录内容
- 点击文件夹进入子目录
- 点击返回按钮返回上级目录
- 显示文件大小和类型图标

## 命令

| 命令 | 功能 |
|------|------|
| /ls | 显示当前目录内容 |
| /ls path | 显示指定路径内容 |

## 界面示例

\`\`\`
📁 src/
├── 📁 handlers/
├── 📁 models/
├── 📁 storage/
├── 📁 utils/
├── 📄 main.ts (2.5KB)
└── 📄 config.ts (1.2KB)

[← 返回] [刷新]
\`\`\`` },
        { type: 'interaction', id: 'block_fb_2', rules: [
          { id: 'rule_fb_1', trigger: '用户发送 /ls', response: '显示当前项目根目录内容' },
          { id: 'rule_fb_2', trigger: '用户点击文件夹', response: '进入该文件夹并显示内容' },
          { id: 'rule_fb_3', trigger: '用户点击返回按钮', response: '返回上级目录' },
        ]},
        { type: 'acceptance', id: 'block_fb_3', criteria: [
          { id: 'ac_fb_1', description: '正确显示目录结构', completed: true },
          { id: 'ac_fb_2', description: '支持深层目录导航', completed: true },
          { id: 'ac_fb_3', description: '文件类型图标显示', completed: true },
        ]},
      ],
      childIds: [],
      createdAt: now,
      updatedAt: now,
    },
  };

  return {
    nodes,
    rootIds: ['node_overview'],
  };
};

interface OutlineActions {
  // 节点选择
  selectNode: (nodeId: string | null) => void;

  // 节点展开/折叠
  toggleNode: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;

  // 节点 CRUD
  createNode: (params: CreateNodeParams) => string;
  updateNode: (params: UpdateNodeParams) => void;
  deleteNode: (nodeId: string) => void;

  // 节点移动
  moveNode: (params: MoveNodeParams) => void;

  // 内容块操作
  updateContentBlock: (nodeId: string, blockId: string, content: Partial<ContentBlock>) => void;
  addContentBlock: (nodeId: string, block: ContentBlock) => void;
  removeContentBlock: (nodeId: string, blockId: string) => void;

  // 视图模式
  setViewMode: (mode: ViewMode) => void;

  // 流程图锁定
  toggleFlowLock: () => void;

  // 获取节点的所有祖先 ID
  getAncestorIds: (nodeId: string) => string[];

  // 获取节点的所有后代 ID
  getDescendantIds: (nodeId: string) => string[];

  // 获取扁平化的节点列表（按照树结构顺序）
  getFlattenedNodes: () => OutlineNode[];
}

type OutlineStore = OutlineState & OutlineActions;

const initialData = createInitialData();

export const useOutlineStore = create<OutlineStore>((set, get) => ({
  // 初始状态
  nodes: initialData.nodes,
  rootIds: initialData.rootIds,
  selectedNodeId: 'node_commands',
  expandedNodeIds: new Set(['node_overview', 'node_telegram', 'node_desktop']),
  viewMode: 'outline',
  isFlowLocked: true,

  // 节点选择
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  // 节点展开/折叠
  toggleNode: (nodeId) => set((state) => {
    const newExpanded = new Set(state.expandedNodeIds);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    return { expandedNodeIds: newExpanded };
  }),

  expandNode: (nodeId) => set((state) => {
    const newExpanded = new Set(state.expandedNodeIds);
    newExpanded.add(nodeId);
    return { expandedNodeIds: newExpanded };
  }),

  collapseNode: (nodeId) => set((state) => {
    const newExpanded = new Set(state.expandedNodeIds);
    newExpanded.delete(nodeId);
    return { expandedNodeIds: newExpanded };
  }),

  expandAll: () => set((state) => ({
    expandedNodeIds: new Set(Object.keys(state.nodes)),
  })),

  collapseAll: () => set({ expandedNodeIds: new Set() }),

  // 创建节点
  createNode: (params) => {
    const id = generateId();
    const now = new Date().toISOString();
    const { nodes, rootIds } = get();

    // 确定父节点和层级
    const parentId = params.parentId ?? null;
    const parent = parentId ? nodes[parentId] : null;
    const level = parent ? parent.level + 1 : 0;

    // 确定顺序
    let order = 0;
    if (params.afterNodeId && parentId) {
      const siblings = parent?.childIds || [];
      const afterIndex = siblings.indexOf(params.afterNodeId);
      order = afterIndex >= 0 ? afterIndex + 1 : siblings.length;
    } else if (parentId && parent) {
      order = parent.childIds.length;
    } else {
      order = rootIds.length;
    }

    const newNode: OutlineNode = {
      id,
      title: params.title,
      level,
      order,
      parentId,
      flowType: params.flowType || 'page',
      contentBlocks: [
        { type: 'markdown', id: `block_${Date.now()}`, content: `## ${params.title}\n\n描述...` }
      ],
      childIds: [],
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const newNodes = { ...state.nodes, [id]: newNode };
      let newRootIds = [...state.rootIds];

      if (parentId) {
        // 添加到父节点的 childIds
        const parentNode = newNodes[parentId];
        if (parentNode) {
          const newChildIds = [...parentNode.childIds];
          newChildIds.splice(order, 0, id);
          newNodes[parentId] = { ...parentNode, childIds: newChildIds, updatedAt: now };
        }
      } else {
        // 添加到根节点列表
        newRootIds.splice(order, 0, id);
      }

      return { nodes: newNodes, rootIds: newRootIds };
    });

    return id;
  },

  // 更新节点
  updateNode: (params) => set((state) => {
    const node = state.nodes[params.id];
    if (!node) return state;

    const updatedNode: OutlineNode = {
      ...node,
      ...(params.title !== undefined && { title: params.title }),
      ...(params.flowType !== undefined && { flowType: params.flowType }),
      ...(params.contentBlocks !== undefined && { contentBlocks: params.contentBlocks }),
      updatedAt: new Date().toISOString(),
    };

    return {
      nodes: { ...state.nodes, [params.id]: updatedNode },
    };
  }),

  // 删除节点
  deleteNode: (nodeId) => set((state) => {
    const node = state.nodes[nodeId];
    if (!node) return state;

    // 递归获取所有后代节点 ID
    const getAllDescendants = (id: string): string[] => {
      const n = state.nodes[id];
      if (!n) return [];
      return [id, ...n.childIds.flatMap(getAllDescendants)];
    };

    const idsToDelete = getAllDescendants(nodeId);
    const newNodes = { ...state.nodes };
    idsToDelete.forEach((id) => delete newNodes[id]);

    // 从父节点移除
    let newRootIds = state.rootIds;
    if (node.parentId) {
      const parent = newNodes[node.parentId];
      if (parent) {
        newNodes[node.parentId] = {
          ...parent,
          childIds: parent.childIds.filter((id) => id !== nodeId),
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      newRootIds = state.rootIds.filter((id) => id !== nodeId);
    }

    return {
      nodes: newNodes,
      rootIds: newRootIds,
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    };
  }),

  // 移动节点
  moveNode: (params) => set((state) => {
    const { nodeId, targetParentId, targetIndex } = params;
    const node = state.nodes[nodeId];
    if (!node) return state;

    const now = new Date().toISOString();
    const newNodes = { ...state.nodes };
    let newRootIds = [...state.rootIds];

    // 从原位置移除
    if (node.parentId) {
      const oldParent = newNodes[node.parentId];
      if (oldParent) {
        newNodes[node.parentId] = {
          ...oldParent,
          childIds: oldParent.childIds.filter((id) => id !== nodeId),
          updatedAt: now,
        };
      }
    } else {
      newRootIds = newRootIds.filter((id) => id !== nodeId);
    }

    // 更新节点的父节点和层级
    const newParent = targetParentId ? newNodes[targetParentId] : null;
    const newLevel = newParent ? newParent.level + 1 : 0;

    newNodes[nodeId] = {
      ...node,
      parentId: targetParentId,
      level: newLevel,
      order: targetIndex,
      updatedAt: now,
    };

    // 添加到新位置
    if (targetParentId && newParent) {
      const newChildIds = [...newParent.childIds];
      newChildIds.splice(targetIndex, 0, nodeId);
      newNodes[targetParentId] = {
        ...newParent,
        childIds: newChildIds,
        updatedAt: now,
      };
    } else {
      newRootIds.splice(targetIndex, 0, nodeId);
    }

    // 递归更新后代节点的层级
    const updateDescendantLevels = (id: string, parentLevel: number) => {
      const n = newNodes[id];
      if (!n) return;
      n.childIds.forEach((childId) => {
        const child = newNodes[childId];
        if (child) {
          newNodes[childId] = { ...child, level: parentLevel + 1 };
          updateDescendantLevels(childId, parentLevel + 1);
        }
      });
    };
    updateDescendantLevels(nodeId, newLevel);

    return { nodes: newNodes, rootIds: newRootIds };
  }),

  // 更新内容块
  updateContentBlock: (nodeId, blockId, content) => set((state) => {
    const node = state.nodes[nodeId];
    if (!node) return state;

    const updatedBlocks = node.contentBlocks.map((block) =>
      block.id === blockId ? { ...block, ...content } : block
    );

    return {
      nodes: {
        ...state.nodes,
        [nodeId]: {
          ...node,
          contentBlocks: updatedBlocks as ContentBlock[],
          updatedAt: new Date().toISOString(),
        },
      },
    };
  }),

  // 添加内容块
  addContentBlock: (nodeId, block) => set((state) => {
    const node = state.nodes[nodeId];
    if (!node) return state;

    return {
      nodes: {
        ...state.nodes,
        [nodeId]: {
          ...node,
          contentBlocks: [...node.contentBlocks, block],
          updatedAt: new Date().toISOString(),
        },
      },
    };
  }),

  // 移除内容块
  removeContentBlock: (nodeId, blockId) => set((state) => {
    const node = state.nodes[nodeId];
    if (!node) return state;

    return {
      nodes: {
        ...state.nodes,
        [nodeId]: {
          ...node,
          contentBlocks: node.contentBlocks.filter((b) => b.id !== blockId),
          updatedAt: new Date().toISOString(),
        },
      },
    };
  }),

  // 视图模式
  setViewMode: (mode) => set({ viewMode: mode }),

  // 流程图锁定
  toggleFlowLock: () => set((state) => ({ isFlowLocked: !state.isFlowLocked })),

  // 获取节点的所有祖先 ID
  getAncestorIds: (nodeId) => {
    const { nodes } = get();
    const ancestors: string[] = [];
    let current = nodes[nodeId];
    while (current?.parentId) {
      ancestors.push(current.parentId);
      current = nodes[current.parentId];
    }
    return ancestors;
  },

  // 获取节点的所有后代 ID
  getDescendantIds: (nodeId) => {
    const { nodes } = get();
    const descendants: string[] = [];
    const collect = (id: string) => {
      const node = nodes[id];
      if (node) {
        node.childIds.forEach((childId) => {
          descendants.push(childId);
          collect(childId);
        });
      }
    };
    collect(nodeId);
    return descendants;
  },

  // 获取扁平化的节点列表
  getFlattenedNodes: () => {
    const { nodes, rootIds } = get();
    const result: OutlineNode[] = [];

    const traverse = (ids: string[]) => {
      ids.forEach((id) => {
        const node = nodes[id];
        if (node) {
          result.push(node);
          traverse(node.childIds);
        }
      });
    };

    traverse(rootIds);
    return result;
  },
}));
