// 文档来源配置 - 将页面 slug 映射到 Markdown 文件路径

export interface DocSource {
  slug: string;
  title: string;
  docPath: string;  // Obsidian Markdown 文件路径
  prototypeId?: string;  // 对应的原型组件 ID
}

// EssayPass 项目文档来源
export const essaypassDocSources: DocSource[] = [
  {
    slug: "hero",
    title: "Hero 区域 PRD",
    docPath: "/Users/wanghao/note/仓库 2/工作/EssayPass-Demo/Hero-PRD.md",
    prototypeId: "essaypass-hero",
  },
  {
    slug: "essay-form",
    title: "表单页 PRD",
    docPath: "/Users/wanghao/note/仓库 2/工作/EssayPass-Demo/EssayForm-PRD.md",
    prototypeId: "essaypass-form",
  },
  {
    slug: "order-confirmation",
    title: "待支付页 PRD",
    docPath: "/Users/wanghao/note/仓库 2/工作/EssayPass-Demo/OrderConfirmation-PRD.md",
    prototypeId: "essaypass-order",
  },
];

// C2ME 项目文档来源 (待配置)
export const c2meDocSources: DocSource[] = [];

// 根据项目和页面 slug 获取文档来源
export function getDocSource(projectSlug: string, pageSlug: string): DocSource | null {
  let sources: DocSource[] = [];

  switch (projectSlug) {
    case "essaypass":
      sources = essaypassDocSources;
      break;
    case "c2me":
      sources = c2meDocSources;
      break;
  }

  return sources.find(s => s.slug === pageSlug) || null;
}

// 获取项目的 Obsidian 笔记根目录
export function getProjectNotesDir(projectSlug: string): string | null {
  const dirs: Record<string, string> = {
    essaypass: "/Users/wanghao/note/仓库 2/工作/EssayPass-Demo",
    // c2me: "/Users/wanghao/note/仓库 2/工作/C2ME",
  };

  return dirs[projectSlug] || null;
}
