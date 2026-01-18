# ProtoDoc 功能完善实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完善 ProtoDoc 的四大核心功能：动态目录、响应式预览、版本对比、全屏模式

**Architecture:**
- 动态目录通过约定式路由 + 配置文件实现，每个页面导出 metadata
- 响应式预览在工具栏添加设备切换按钮，通过 CSS transform 缩放
- 版本对比新增 compare 模式，左右并排渲染两个版本
- 全屏模式通过状态控制侧边栏显隐，支持键盘快捷键

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS

---

## Phase 1: 动态文档目录

### Task 1.1: 创建文档配置类型

**Files:**
- Create: `src/types/doc.ts`

**Step 1: 创建类型定义文件**

```typescript
// src/types/doc.ts
export interface DocMeta {
  title: string;
  description?: string;
  icon?: string;
  order?: number;
  status?: "draft" | "review" | "approved";
}

export interface DocNavItem {
  slug: string;
  title: string;
  href: string;
  status?: DocMeta["status"];
  order: number;
}
```

**Step 2: Commit**

```bash
git add src/types/doc.ts
git commit -m "feat: add doc metadata types"
```

---

### Task 1.2: 创建文档注册表

**Files:**
- Create: `src/config/docs.ts`

**Step 1: 创建文档配置**

```typescript
// src/config/docs.ts
import { DocNavItem } from "@/types/doc";

// 手动注册文档（简单可控，避免动态扫描的复杂性）
export const docsRegistry: DocNavItem[] = [
  {
    slug: "login",
    title: "登录功能",
    href: "/docs/login",
    status: "approved",
    order: 1,
  },
  // 新增页面时在这里添加
];

export function getDocsNav(): DocNavItem[] {
  return docsRegistry.sort((a, b) => a.order - b.order);
}
```

**Step 2: Commit**

```bash
git add src/config/docs.ts
git commit -m "feat: add docs registry config"
```

---

### Task 1.3: 重构 DocLayout 使用动态目录

**Files:**
- Modify: `src/components/layout/DocLayout.tsx`

**Step 1: 修改 DocLayout 导入和使用动态目录**

在文件顶部添加导入：
```typescript
import { usePathname } from "next/navigation";
import { getDocsNav } from "@/config/docs";
```

替换硬编码的 nav 部分（约第 52-78 行）为：

```typescript
{/* 文档目录 */}
<div className="p-4 border-b border-gray-100">
  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
    文档目录
  </h2>
  <nav className="space-y-1">
    {getDocsNav().map((doc) => {
      const isActive = pathname === doc.href;
      return (
        <Link
          key={doc.slug}
          href={doc.href}
          className={`flex items-center px-3 py-2 text-sm rounded-lg transition ${
            isActive
              ? "bg-blue-50 text-blue-700 font-medium"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full mr-2 ${
              isActive ? "bg-blue-500" :
              doc.status === "approved" ? "bg-green-400" :
              doc.status === "review" ? "bg-yellow-400" : "bg-gray-300"
            }`}
          />
          {doc.title}
        </Link>
      );
    })}
  </nav>
</div>
```

在组件函数开头添加：
```typescript
const pathname = usePathname();
```

**Step 2: 验证页面正常渲染**

访问 http://localhost:3000/docs/login 确认目录显示正常

**Step 3: Commit**

```bash
git add src/components/layout/DocLayout.tsx
git commit -m "feat: dynamic doc navigation from registry"
```

---

## Phase 2: 响应式预览

### Task 2.1: 创建设备预设配置

**Files:**
- Create: `src/config/devices.ts`

**Step 1: 创建设备配置**

```typescript
// src/config/devices.ts
export interface Device {
  id: string;
  label: string;
  icon: string;
  width: number;
  height?: number;
}

export const devices: Device[] = [
  { id: "mobile", label: "手机", icon: "📱", width: 375, height: 667 },
  { id: "tablet", label: "平板", icon: "📱", width: 768, height: 1024 },
  { id: "desktop", label: "桌面", icon: "🖥️", width: 1280 },
];

export const defaultDevice = "desktop";
```

**Step 2: Commit**

```bash
git add src/config/devices.ts
git commit -m "feat: add device presets for responsive preview"
```

---

### Task 2.2: 创建设备切换工具栏组件

**Files:**
- Create: `src/components/layout/DeviceToolbar.tsx`

**Step 1: 创建工具栏组件**

```typescript
// src/components/layout/DeviceToolbar.tsx
"use client";

import { devices, Device } from "@/config/devices";

interface DeviceToolbarProps {
  currentDevice: string;
  onDeviceChange: (deviceId: string) => void;
}

export function DeviceToolbar({ currentDevice, onDeviceChange }: DeviceToolbarProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {devices.map((device) => (
        <button
          key={device.id}
          onClick={() => onDeviceChange(device.id)}
          className={`px-3 py-1.5 text-sm rounded-md transition flex items-center gap-1.5 ${
            device.id === currentDevice
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          title={`${device.label} (${device.width}px)`}
        >
          <span>{device.icon}</span>
          <span className="hidden sm:inline">{device.label}</span>
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/DeviceToolbar.tsx
git commit -m "feat: add device toolbar component"
```

---

### Task 2.3: 创建设备预览容器组件

**Files:**
- Create: `src/components/layout/DeviceFrame.tsx`

**Step 1: 创建预览容器**

```typescript
// src/components/layout/DeviceFrame.tsx
"use client";

import { devices } from "@/config/devices";

interface DeviceFrameProps {
  deviceId: string;
  children: React.ReactNode;
}

export function DeviceFrame({ deviceId, children }: DeviceFrameProps) {
  const device = devices.find((d) => d.id === deviceId);

  if (!device || deviceId === "desktop") {
    // 桌面模式：不加框架，自适应
    return <div className="w-full h-full flex items-center justify-center">{children}</div>;
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className="bg-white rounded-3xl shadow-2xl border-8 border-gray-800 overflow-hidden"
        style={{
          width: device.width,
          height: device.height,
        }}
      >
        {/* 设备顶部状态栏 */}
        <div className="h-6 bg-gray-800 flex items-center justify-center">
          <div className="w-16 h-1 bg-gray-600 rounded-full" />
        </div>
        {/* 内容区域 */}
        <div className="h-[calc(100%-24px)] overflow-auto bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/DeviceFrame.tsx
git commit -m "feat: add device frame container"
```

---

### Task 2.4: 集成设备预览到 DocLayout

**Files:**
- Modify: `src/components/layout/DocLayout.tsx`
- Modify: `src/components/layout/index.ts`

**Step 1: 更新 index.ts 导出**

```typescript
// src/components/layout/index.ts
export { DocLayout } from "./DocLayout";
export { DeviceToolbar } from "./DeviceToolbar";
export { DeviceFrame } from "./DeviceFrame";
```

**Step 2: 在 DocLayout 添加设备状态和工具栏**

在 DocLayout.tsx 顶部添加导入：
```typescript
import { DeviceToolbar } from "./DeviceToolbar";
import { DeviceFrame } from "./DeviceFrame";
import { defaultDevice } from "@/config/devices";
```

在组件内添加状态（在其他 useState 后面）：
```typescript
const [currentDevice, setCurrentDevice] = useState(defaultDevice);
```

修改工具栏区域（约第 163-182 行），在状态切换栏中加入设备切换：

```typescript
{/* 工具栏 */}
<div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
  <div className="flex items-center gap-2">
    {states.length > 0 && (
      <>
        <span className="text-xs text-gray-500 mr-1">状态：</span>
        {states.map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentState(s.id)}
            className={`px-3 py-1.5 text-sm rounded-full transition ${
              s.id === currentState
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </>
    )}
  </div>
  <DeviceToolbar currentDevice={currentDevice} onDeviceChange={setCurrentDevice} />
</div>
```

修改原型展示区（约第 184-187 行）：

```typescript
{/* 原型展示区 */}
<div className="flex-1 overflow-auto bg-gray-100 p-8">
  <DeviceFrame deviceId={currentDevice}>
    {children({ version: currentVersion, state: currentState })}
  </DeviceFrame>
</div>
```

**Step 3: 验证设备切换正常工作**

访问页面，点击手机/平板/桌面按钮，确认原型容器大小变化

**Step 4: Commit**

```bash
git add src/components/layout/
git commit -m "feat: integrate responsive device preview"
```

---

## Phase 3: 版本对比

### Task 3.1: 添加对比模式状态

**Files:**
- Modify: `src/components/layout/DocLayout.tsx`

**Step 1: 添加对比模式状态和 UI**

在 DocLayout 组件添加状态：
```typescript
const [compareMode, setCompareMode] = useState(false);
const [compareVersion, setCompareVersion] = useState<string | null>(null);
```

在工具栏左侧（状态按钮后）添加对比按钮：
```typescript
{versions.length > 1 && (
  <button
    onClick={() => {
      if (compareMode) {
        setCompareMode(false);
        setCompareVersion(null);
      } else {
        setCompareMode(true);
        // 默认对比当前版本的前一个版本
        const currentIdx = versions.findIndex(v => v.id === currentVersion);
        const compareIdx = currentIdx < versions.length - 1 ? currentIdx + 1 : 0;
        setCompareVersion(versions[compareIdx].id);
      }
    }}
    className={`px-3 py-1.5 text-sm rounded-full transition ml-4 ${
      compareMode
        ? "bg-orange-500 text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {compareMode ? "退出对比" : "版本对比"}
  </button>
)}
```

**Step 2: Commit**

```bash
git add src/components/layout/DocLayout.tsx
git commit -m "feat: add compare mode toggle"
```

---

### Task 3.2: 实现对比视图渲染

**Files:**
- Modify: `src/components/layout/DocLayout.tsx`

**Step 1: 修改原型展示区支持对比模式**

替换原型展示区为：

```typescript
{/* 原型展示区 */}
<div className="flex-1 overflow-auto bg-gray-100 p-8">
  {compareMode && compareVersion ? (
    // 对比模式：左右并排
    <div className="flex gap-8 h-full">
      <div className="flex-1 flex flex-col">
        <div className="text-center mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
            {versions.find(v => v.id === currentVersion)?.label || currentVersion}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm p-4">
          {children({ version: currentVersion, state: currentState })}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="text-center mb-4">
          <select
            value={compareVersion}
            onChange={(e) => setCompareVersion(e.target.value)}
            className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full border-none cursor-pointer"
          >
            {versions.filter(v => v.id !== currentVersion).map(v => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm p-4">
          {children({ version: compareVersion, state: currentState })}
        </div>
      </div>
    </div>
  ) : (
    // 正常模式
    <DeviceFrame deviceId={currentDevice}>
      {children({ version: currentVersion, state: currentState })}
    </DeviceFrame>
  )}
</div>
```

**Step 2: 验证对比模式**

点击"版本对比"按钮，确认左右两个版本并排显示

**Step 3: Commit**

```bash
git add src/components/layout/DocLayout.tsx
git commit -m "feat: implement side-by-side version compare view"
```

---

## Phase 4: 全屏预览

### Task 4.1: 添加全屏状态和切换按钮

**Files:**
- Modify: `src/components/layout/DocLayout.tsx`

**Step 1: 添加全屏状态**

在组件内添加状态：
```typescript
const [isFullscreen, setIsFullscreen] = useState(false);
```

**Step 2: 在工具栏右侧（设备切换后）添加全屏按钮**

```typescript
<button
  onClick={() => setIsFullscreen(!isFullscreen)}
  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition ml-2"
  title={isFullscreen ? "退出全屏 (Esc)" : "全屏预览 (F)"}
>
  {isFullscreen ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  )}
</button>
```

**Step 3: Commit**

```bash
git add src/components/layout/DocLayout.tsx
git commit -m "feat: add fullscreen toggle button"
```

---

### Task 4.2: 实现全屏布局切换

**Files:**
- Modify: `src/components/layout/DocLayout.tsx`

**Step 1: 修改侧边栏根据全屏状态显隐**

将侧边栏 aside 包装：
```typescript
{!isFullscreen && (
  <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
    {/* 原有侧边栏内容 */}
  </aside>
)}
```

**Step 2: 添加键盘快捷键支持**

在组件内添加 useEffect：
```typescript
import { useEffect } from "react";

// 在组件内部
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isFullscreen) {
      setIsFullscreen(false);
    }
    if (e.key === "f" && !e.metaKey && !e.ctrlKey && e.target === document.body) {
      setIsFullscreen(!isFullscreen);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isFullscreen]);
```

**Step 3: 验证全屏功能**

点击全屏按钮，侧边栏消失；按 Esc 或再次点击，恢复

**Step 4: Commit**

```bash
git add src/components/layout/DocLayout.tsx
git commit -m "feat: implement fullscreen mode with keyboard shortcuts"
```

---

## Phase 5: 收尾

### Task 5.1: 更新 Obsidian 进度

**Files:**
- Modify: `/Users/wanghao/note/仓库 2/项目/ProtoDoc/_Overview.md`
- Modify: `/Users/wanghao/note/仓库 2/项目/ProtoDoc/_Changelog.md`

**Step 1: 更新 _Overview.md 进度到 60%**

更新已完成列表，添加：
- [x] 动态文档目录
- [x] 响应式设备预览
- [x] 版本对比功能
- [x] 全屏预览模式

**Step 2: 更新 _Changelog.md**

添加 v0.2.0 版本记录

**Step 3: Commit all**

```bash
git add .
git commit -m "feat: complete phase 1-4 features (v0.2.0)"
```

---

## 功能完成后的效果

```
┌────────────────────────────────────────────────────────────────────┐
│ 侧边栏              │ 状态:[默认][倒计时] [版本对比]   📱📱🖥️  ⛶  │
│ (可全屏隐藏)        ├──────────────────────────────────────────────│
│                    │                                              │
│ 📁 文档目录         │     ┌─────────────┐ ┌─────────────┐         │
│   ● 登录功能        │     │    V2       │ │    V1       │         │
│   ○ 注册流程        │     │  (当前)     │ │  (对比)     │         │
│                    │     └─────────────┘ └─────────────┘         │
│ [说明][版本][决策]  │                                              │
│                    │         ↑ 对比模式：左右并排                  │
│                    │         ↑ 可切换设备尺寸                      │
└────────────────────────────────────────────────────────────────────┘
```

---

**Plan complete and saved to `docs/plans/2024-01-18-protodoc-features.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
