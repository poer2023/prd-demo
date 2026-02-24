// src/config/docs.ts
import { DocNavItem } from "@/types/doc";

export interface NavItem {
  slug: string;
  title: string;
  href: string;
  prototypeId?: string; // 关联的原型 ID
  children?: NavItem[];
}

// 树形导航结构 - 按项目组织
export const docsNavTree: NavItem[] = [
  {
    slug: "login",
    title: "登录功能",
    href: "/docs/login",
    children: [
      { slug: "login-v1", title: "V1 - 验证码在下方", href: "/docs/login#version-v1" },
      { slug: "login-v2", title: "V2 - 验证码内嵌", href: "/docs/login#version-v2" },
    ],
  },
  {
    slug: "register",
    title: "注册流程",
    href: "/docs/register",
  },
  {
    slug: "profile",
    title: "个人中心",
    href: "/docs/profile",
  },
];

// C2ME 项目导航
export const c2meNavTree: NavItem[] = [
  {
    slug: "overview",
    title: "C2ME 项目概述",
    href: "/docs/c2me",
  },
  {
    slug: "telegram",
    title: "Telegram Bot",
    href: "/docs/c2me/telegram",
    children: [
      { slug: "commands", title: "命令系统", href: "/docs/c2me/telegram/commands" },
      { slug: "messages", title: "消息处理", href: "/docs/c2me/telegram/messages" },
      { slug: "permissions", title: "权限系统", href: "/docs/c2me/telegram/permissions" },
      { slug: "project", title: "项目管理", href: "/docs/c2me/telegram/project" },
      { slug: "filebrowser", title: "文件浏览器", href: "/docs/c2me/telegram/filebrowser" },
    ],
  },
  {
    slug: "desktop",
    title: "Desktop 管理应用",
    href: "/docs/c2me/desktop",
    children: [
      { slug: "metrics", title: "指标面板", href: "/docs/c2me/desktop/metrics" },
      { slug: "simulator", title: "消息模拟器", href: "/docs/c2me/desktop/simulator" },
    ],
  },
  {
    slug: "workers",
    title: "Cloudflare Workers",
    href: "/docs/c2me/workers",
  },
];

// EssayPass 项目导航
export const essaypassNavTree: NavItem[] = [
  {
    slug: "hero",
    title: "Hero 区域 PRD",
    href: "/workspace/essaypass/hero",
    prototypeId: "essaypass-hero",
  },
  {
    slug: "essay-form",
    title: "表单页 PRD",
    href: "/workspace/essaypass/essay-form",
    prototypeId: "essaypass-form",
  },
  {
    slug: "order-confirmation",
    title: "待支付页 PRD",
    href: "/workspace/essaypass/order-confirmation",
    prototypeId: "essaypass-order",
  },
];

// 兼容旧的扁平结构
export const docsRegistry: DocNavItem[] = [
  {
    slug: "login",
    title: "登录功能",
    href: "/docs/login",
    status: "approved",
    order: 1,
  },
];

export function getDocsNav(): DocNavItem[] {
  return docsRegistry.sort((a, b) => a.order - b.order);
}

export function getDocsNavTree(): NavItem[] {
  return docsNavTree;
}

// 按项目获取导航
export function getNavTreeByProject(projectSlug: string): NavItem[] {
  switch (projectSlug) {
    case "essaypass":
      return essaypassNavTree;
    case "c2me":
      return c2meNavTree;
    default:
      return docsNavTree;
  }
}

// 根据项目和页面 slug 查找页面配置
export function findPageConfig(projectSlug: string, pageSlug: string): NavItem | null {
  const navTree = getNavTreeByProject(projectSlug);

  function findInTree(items: NavItem[]): NavItem | null {
    for (const item of items) {
      if (item.slug === pageSlug) {
        return item;
      }
      if (item.children) {
        const found = findInTree(item.children);
        if (found) return found;
      }
    }
    return null;
  }

  return findInTree(navTree);
}
