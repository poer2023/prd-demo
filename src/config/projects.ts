export interface Project {
  id: string;
  name: string;
  description: string;
  slug: string;
  visibility: "public" | "private";
  color?: string; // 渐变色起始色
  updatedAt: string;
}

export const projects: Project[] = [
  {
    id: "0",
    name: "C2ME",
    description: "企业级协作平台 - Telegram Bot、命令系统、消息处理、权限管理",
    slug: "c2me",
    visibility: "public",
    color: "#fde68a", // 淡黄
    updatedAt: "2025-01-19",
  },
  {
    id: "1",
    name: "登录优化",
    description: "优化登录转化率，将验证码按钮从输入框下方移到输入框内部",
    slug: "login",
    visibility: "public",
    color: "#c7d2fe", // 淡紫
    updatedAt: "2024-01-18",
  },
  {
    id: "2",
    name: "注册流程",
    description: "新用户注册流程设计，包含手机号验证和基本信息填写",
    slug: "register",
    visibility: "public",
    color: "#bbf7d0", // 淡绿
    updatedAt: "2024-01-15",
  },
  {
    id: "3",
    name: "个人中心",
    description: "用户个人中心页面，包含资料编辑、安全设置等功能",
    slug: "profile",
    visibility: "private",
    color: "#fecaca", // 淡红
    updatedAt: "2024-01-10",
  },
  {
    id: "4",
    name: "EssayPass",
    description: "AI 论文写作助手 - 从需求到成稿的一站式解决方案",
    slug: "essaypass",
    visibility: "public",
    color: "#a5f3fc", // 淡青
    updatedAt: "2025-01-19",
  },
];

export function getPublicProjects(): Project[] {
  return projects.filter((p) => p.visibility === "public");
}

export function getAllProjects(): Project[] {
  return projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
